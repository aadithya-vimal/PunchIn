import React, { createContext, useContext } from 'react';
import { UserContext } from './UserContext';

export const AIContext = createContext();

const callSecureAI = async (promptOrData) => {
    try {
        let messages = [];

        if (typeof promptOrData === 'string') {
            messages = [{ role: "user", content: promptOrData }];
        } else {
            const { promptType, data } = promptOrData;

            if (promptType === 'simple_chat') {
                const { query, context } = data;
                
                const systemPrompt = `
You are a smart, concise academic assistant.
Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

USER DATA CONTEXT:
${context || "No data available."}

---
### **CRITICAL INSTRUCTIONS:**
1. **NO WALLS OF TEXT:** Never list daily schedules, "Upcoming Classes", or repeat the timetable in your response. The user knows their schedule.
2. **ANSWER DIRECTLY:** If asked "What happens if...", start immediately with the result (e.g., "Your attendance will rise to 85%").
3. **CALCULATING DATE RANGES (e.g., "Till Dec 20th"):**
   - Count the number of weeks/days remaining.
   - Multiply by the classes per week found in the 'WEEKLY SCHEDULE'.
   - Add this to the 'Total Classes' and 'Total Attended' (if attending).
   - **Do not show the step-by-step counting of days.** Just do the math.
4. **SATURDAY/SUNDAY:** Check the timetable. If no classes are listed for Saturday, assume it is a holiday. Sunday is always a holiday.
---
`;
                messages = [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: query }
                ];
            } else if (promptType === 'result_insights') {
                const { resultsText } = data;
                messages = [
                    { role: "system", content: "You are an encouraging academic advisor." },
                    { role: "user", content: `Based on this calculation result: "${resultsText}", provide 2-3 sentences of encouraging, actionable advice in plain text.` }
                ];
            } else {
                messages = [{ role: "user", content: JSON.stringify(data) }];
            }
        }

        // Call the secure Cloudflare function
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            throw new Error(`AI is currently busy (Status: ${response.status})`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response generated.";

    } catch (error) {
        console.error("AI Error:", error);
        return "Sorry, I couldn't reach the AI. Please try again.";
    }
};

export const AIProvider = ({ children }) => {
    const { subjects, attendanceData, timetable } = useContext(UserContext);

    const getBunkRecommendation = async (prompt) => {
        if (!prompt) return 'Error: No prompt provided.';
        return await callSecureAI(prompt);
    };

    const getResultInsights = async (resultsText) => {
        return await callSecureAI({
            promptType: 'result_insights',
            data: { resultsText }
        });
    };

    const askSimpleAI = async (query) => {
        if (!query.trim()) return "Please enter a question.";

        // 1. Calculate Aggregates
        let totalAttended = 0;
        let totalClasses = 0;

        const formattedAttendance = subjects.map((sub, idx) => {
            const data = attendanceData[idx] || { attended: 0, total: 0 };
            const att = Number(data.attended) || 0;
            const tot = Number(data.total) || 0;
            totalAttended += att;
            totalClasses += tot;
            const pct = tot ? ((att / tot) * 100).toFixed(1) : 0;
            return `${sub}: ${att}/${tot} (${pct}%)`;
        }).join('\n');

        const overallPct = totalClasses ? ((totalAttended / totalClasses) * 100).toFixed(2) : 0;

        // 2. Pre-Calculate "Today's" Impact (Specific Math Cheat Sheet)
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayDate = new Date();
        const todayIndex = todayDate.getDay(); 
        const todayKey = daysOfWeek[todayIndex];
        const todaySchedule = timetable[todayKey] || {};
        const classesTodayCount = Object.keys(todaySchedule).length;

        let mathHint = "";
        if (classesTodayCount > 0) {
            const bunkTotal = totalClasses + classesTodayCount;
            const bunkPct = bunkTotal > 0 ? ((totalAttended / bunkTotal) * 100).toFixed(2) : 0;
            const attendTotal = totalClasses + classesTodayCount;
            const attendAttended = totalAttended + classesTodayCount;
            const attendPct = attendTotal > 0 ? ((attendAttended / attendTotal) * 100).toFixed(2) : 0;

            mathHint = `
[MATH CHEAT SHEET FOR TODAY (${todayKey.toUpperCase()})]:
- Classes Today: ${classesTodayCount}
- If BUNK all: New Overall = ${bunkPct}%
- If ATTEND all: New Overall = ${attendPct}%
            `;
        }

        // 3. Simplified Timetable (Just counts per day)
        let scheduleSummary = "";
        daysOfWeek.forEach(day => {
            const count = Object.keys(timetable[day] || {}).length;
            if (count > 0) scheduleSummary += `- ${day.toUpperCase()}: ${count} classes\n`;
        });

        const contextString = `
CURRENT STATS:
Total Attended: ${totalAttended}
Total Classes: ${totalClasses}
Overall %: ${overallPct}%

${mathHint}

WEEKLY SCHEDULE (Classes per day):
${scheduleSummary}

SUBJECT DETAILS:
${formattedAttendance}
        `;

        return await callSecureAI({
            promptType: 'simple_chat',
            data: { 
                query, 
                context: contextString
            }
        });
    };

    const value = { getBunkRecommendation, getResultInsights, askSimpleAI };
    return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};