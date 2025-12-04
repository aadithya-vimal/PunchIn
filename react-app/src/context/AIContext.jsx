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

INSTRUCTIONS:
1. **USE THE PRE-CALCULATED SCENARIOS:** If the user asks about "bunking today" or "attending today", DO NOT calculate it yourself. Look at the "PRE-CALCULATED SCENARIOS" section in the data and just state that number.
2. **FOR OTHER DAYS:**
   - Formula: (Current Total Attended) / (Current Total Classes + New Classes)
   - Do NOT sum up individual subject stats. Use the "OVERALL AGGREGATE STATS" totals.
3. Be concise (max 3-4 sentences).
4. Do not use markdown bold/italics.
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
            temperature: 0.1, // Near zero temp for rigid adherence to data
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

        // 1. Calculate Overall Aggregates
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

        // 2. Format Timetable
        let simplifiedTimetable = "";
        Object.entries(timetable).forEach(([day, periods]) => {
            const daySubjects = Object.values(periods).map(idx => subjects[idx]).filter(Boolean);
            if (daySubjects.length > 0) {
                simplifiedTimetable += `${day.toUpperCase()} (${daySubjects.length} periods): ${daySubjects.join(", ")}\n`;
            }
        });

        // 3. Pre-Calculate "Today" Scenarios (The Fix)
        const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const todaySchedule = timetable[todayKey] || {};
        const classesTodayCount = Object.keys(todaySchedule).length;

        let mathHint = "";
        if (classesTodayCount > 0) {
            // Scenario A: Bunk Everything Today
            // Attended stays same, Total increases by count
            const bunkTotal = totalClasses + classesTodayCount;
            const bunkPct = bunkTotal > 0 ? ((totalAttended / bunkTotal) * 100).toFixed(2) : 0;
            
            // Scenario B: Attend Everything Today
            // Both increase by count
            const attendTotal = totalClasses + classesTodayCount;
            const attendAttended = totalAttended + classesTodayCount;
            const attendPct = attendTotal > 0 ? ((attendAttended / attendTotal) * 100).toFixed(2) : 0;

            mathHint = `
PRE-CALCULATED SCENARIOS FOR TODAY (${todayKey.toUpperCase()}):
- Classes Scheduled Today: ${classesTodayCount}
- If you BUNK all classes today: New Overall = ${bunkPct}%
- If you ATTEND all classes today: New Overall = ${attendPct}%
            `;
        }

        const contextString = `
OVERALL AGGREGATE STATS:
Total Attended: ${totalAttended}
Total Classes Held: ${totalClasses}
Current Overall Percentage: ${overallPct}%

${mathHint}

SUBJECT-WISE STATS:
${formattedAttendance}

WEEKLY SCHEDULE:
${simplifiedTimetable}
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