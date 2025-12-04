import React, { createContext, useContext } from 'react';
import { UserContext } from './UserContext';

export const AIContext = createContext();

const callSecureAI = async (promptOrData) => {
    try {
        let messages = [];

        // --- 1. PROMPT CONSTRUCTION (Same Logic as before) ---
        if (typeof promptOrData === 'string') {
            messages = [{ role: "user", content: promptOrData }];
        } else {
            const { promptType, data } = promptOrData;

            if (promptType === 'simple_chat') {
                const { query, context } = data;
                
                const systemPrompt = `
You are a smart academic assistant.
Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

USER DATA:
${context || "No data available."}

MATH INSTRUCTIONS (STRICT):
1. **BASELINE:** Always start with 'Total Attended' and 'Total Classes Held' from OVERALL AGGREGATE STATS.
2. **DO NOT DOUBLE COUNT:** Never add "past days". Only add *future* classes based on the user's query.
3. **FORMULA:** New % = (Current Attended + Future Attended) / (Current Total + Future Total) * 100
4. **SANITY CHECK:** If result > 100%, recalculate.

EXAMPLE:
- Query: "If I attend Friday and bunk Saturday?"
- Logic: Look at "UPCOMING CLASSES". Total = Current Total + Friday_Count + Saturday_Count. Attended = Current Attended + Friday_Count.
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

        // --- 2. SECURE CALL (Changed) ---
        // We now call our own backend function /api/chat instead of Groq directly
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            throw new Error(`AI is currently busy or offline (Status: ${response.status})`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response generated.";

    } catch (error) {
        console.error("AI Security Proxy Error:", error);
        return "Sorry, I couldn't reach the AI. Please try again in a moment.";
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

        // --- DATA PREP (Same Logic as before) ---
        let totalAttended = 0;
        let totalClasses = 0;

        const formattedAttendance = subjects.map((sub, idx) => {
            const data = attendanceData[idx] || { attended: 0, total: 0 };
            const att = Number(data.attended) || 0;
            const tot = Number(data.total) || 0;
            totalAttended += att;
            totalClasses += tot;
            const pct = tot ? ((att / tot) * 100).toFixed(1) : 0;
            return `Subject: "${sub}" | Attended: ${att} | Total: ${tot} | Current: ${pct}%`;
        }).join('\n');

        const overallPct = totalClasses ? ((totalAttended / totalClasses) * 100).toFixed(2) : 0;

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
SCENARIOS FOR TODAY (${todayKey.toUpperCase()}):
- Classes Today: ${classesTodayCount}
- If BUNK all today: New Overall = ${bunkPct}%
- If ATTEND all today: New Overall = ${attendPct}%
            `;
        }

        let upcomingScheduleStr = "";
        for (let i = todayIndex + 1; i <= 6; i++) {
            const dayName = daysOfWeek[i];
            const daySchedule = timetable[dayName] || {};
            const count = Object.keys(daySchedule).length;
            if (count > 0) {
                upcomingScheduleStr += `- ${dayName.toUpperCase()}: ${count} classes\n`;
            }
        }
        
        if (upcomingScheduleStr) {
            upcomingScheduleStr = "\nUPCOMING CLASSES THIS WEEK:\n" + upcomingScheduleStr;
        }

        const contextString = `
OVERALL AGGREGATE STATS (CURRENT STATUS):
Total Attended: ${totalAttended}
Total Classes Held: ${totalClasses}
Current Overall Percentage: ${overallPct}%

${mathHint}
${upcomingScheduleStr}

SUBJECT-WISE STATS:
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