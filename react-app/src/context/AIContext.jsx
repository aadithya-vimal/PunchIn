import React, { createContext, useContext } from 'react';
import Groq from "groq-sdk";
import { UserContext } from './UserContext';

export const AIContext = createContext();

// Initialize Groq Client
const groq = new Groq({ 
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
});

const callLlamaAPI = async (promptOrData) => {
    try {
        let messages = [];

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
1. **BASELINE:** Always start with 'Total Attended' and 'Total Classes Held' from OVERALL AGGREGATE STATS. This is the user's CURRENT status (already includes everything up to now).
2. **DO NOT DOUBLE COUNT:** Never add "past days" or "classes till Friday" if they are already in the past. Only add *future* classes based on the user's query.
3. **FORMULA:**
   - New % = (Current Attended + Future Attended) / (Current Total + Future Total) * 100
4. **SANITY CHECK:** If your result is > 100%, you are wrong. Stop and recalculate. Attendance cannot exceed 100%.

EXAMPLE:
- Query: "If I attend Friday and bunk Saturday?"
- Logic: Look at "UPCOMING CLASSES" section. 
- Total = Current Total + Friday_Count + Saturday_Count.
- Attended = Current Attended + Friday_Count (since Saturday is bunked).
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

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
            temperature: 0.1, // Keep it logical
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "";

    } catch (error) {
        console.error("Groq/Llama API call failed:", error);
        return "Sorry, I couldn't reach the AI. Please check your internet connection or API key.";
    }
};

export const AIProvider = ({ children }) => {
    const { subjects, attendanceData, timetable } = useContext(UserContext);

    const getBunkRecommendation = async (prompt) => {
        if (!prompt) return 'Error: No prompt provided.';
        return await callLlamaAPI(prompt);
    };

    const getResultInsights = async (resultsText) => {
        return await callLlamaAPI({
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
            return `Subject: "${sub}" | Attended: ${att} | Total: ${tot} | Current: ${pct}%`;
        }).join('\n');

        const overallPct = totalClasses ? ((totalAttended / totalClasses) * 100).toFixed(2) : 0;

        // 2. Pre-Calculate "Today" Scenarios
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

        // 3. Calculate Upcoming Days (Remainder of Week)
        let upcomingScheduleStr = "";
        // Loop from tomorrow until Saturday
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

        // 4. Construct Context
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

        return await callLlamaAPI({
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