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

INSTRUCTIONS FOR CALCULATIONS:
1. **OVERALL ATTENDANCE:** ALWAYS start with the "OVERALL AGGREGATE STATS" provided in the data. DO NOT sum up individual subjects yourself (this causes double-counting errors).
   - Formula: (Current Total Attended) / (Current Total Classes + New Classes)

2. **SCENARIOS (Bunk vs Attend):**
   - Identify the day and count how many periods are in the timetable for that day.
   - If Bunking: Add that count to the 'Total Classes' only. 'Attended' stays the same.
   - If Attending: Add that count to BOTH 'Total Classes' and 'Attended'.

3. **OUTPUT:**
   - Be concise.
   - Show the math: "Current Overall is X%. If you bunk 6 periods, it becomes Y / Z = New%."
   - Do not use markdown bold/italics.
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
            temperature: 0.2, // Very low temp for consistent math
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

        // --- PRE-CALCULATE AGGREGATES IN JS ---
        let totalAttended = 0;
        let totalClasses = 0;

        const formattedAttendance = subjects.map((sub, idx) => {
            const data = attendanceData[idx] || { attended: 0, total: 0 };
            const att = Number(data.attended) || 0;
            const tot = Number(data.total) || 0;
            
            // Sum up for overall
            totalAttended += att;
            totalClasses += tot;

            const pct = tot ? ((att / tot) * 100).toFixed(1) : 0;
            return `Subject: "${sub}" | Attended: ${att} | Total: ${tot} | Current: ${pct}%`;
        }).join('\n');

        const overallPct = totalClasses ? ((totalAttended / totalClasses) * 100).toFixed(2) : 0;

        // Simplify timetable format
        let simplifiedTimetable = "";
        Object.entries(timetable).forEach(([day, periods]) => {
            const daySubjects = Object.values(periods).map(idx => subjects[idx]).filter(Boolean);
            if (daySubjects.length > 0) {
                simplifiedTimetable += `${day.toUpperCase()} (${daySubjects.length} periods): ${daySubjects.join(", ")}\n`;
            }
        });

        // Pass clear aggregates to AI
        const contextString = `
OVERALL AGGREGATE STATS:
Total Attended: ${totalAttended}
Total Classes Held: ${totalClasses}
Current Overall Percentage: ${overallPct}%

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