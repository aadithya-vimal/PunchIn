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

        // Logic to construct the messages based on input type
        if (typeof promptOrData === 'string') {
            // Case 1: Direct string prompt
            messages = [{ role: "user", content: promptOrData }];
        } else {
            // Case 2: Structured Data object
            const { promptType, data } = promptOrData;

            if (promptType === 'simple_chat') {
                const { query, context } = data;
                
                // Construct the system prompt with user data
                const systemPrompt = `
You are a concise academic assistant for a student.
Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

USER DATA CONTEXT:
${context || "No data available."}

INSTRUCTIONS:
1. Answer the user's query based on the data above.
2. Be very short and direct (max 3-4 sentences).
3. Do not use markdown formatting (no bold/italics), just plain text.
4. If asked about "tomorrow" or "today", check the specific day in the Timetable data.
`;

                messages = [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: query }
                ];
            } else if (promptType === 'result_insights') {
                const { resultsText } = data;
                messages = [
                    {
                        role: "system",
                        content: "You are an encouraging academic advisor."
                    },
                    { 
                        role: "user", 
                        content: `Based on this calculation result: "${resultsText}", provide 2-3 sentences of encouraging, actionable advice in plain text.` 
                    }
                ];
            } else {
                // Fallback
                messages = [{ role: "user", content: JSON.stringify(data) }];
            }
        }

        // Call Llama 3.1 8B (Instant speed)
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "";

    } catch (error) {
        console.error("Groq/Llama API call failed:", error);
        return "Sorry, I couldn't reach the AI. Please check your internet connection or API key.";
    }
};

export const AIProvider = ({ children }) => {
    // Consume UserContext to get real-time data
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

        // Format the data nicely for the AI to understand
        const formattedAttendance = subjects.map((sub, idx) => {
            const data = attendanceData[idx] || { attended: 0, total: 0 };
            const pct = data.total ? ((data.attended / data.total) * 100).toFixed(1) : 0;
            return `${sub}: ${data.attended}/${data.total} (${pct}%)`;
        }).join('\n');

        const contextString = `
Subjects & Attendance:
${formattedAttendance}

Weekly Timetable (Periods 1-8):
${JSON.stringify(timetable, null, 2)}
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