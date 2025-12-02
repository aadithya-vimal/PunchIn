import React, { createContext, useContext } from 'react';
import Groq from "groq-sdk";

export const AIContext = createContext();

// Initialize Groq Client
// dangerouslyAllowBrowser is required because we are calling it from React directly
const groq = new Groq({ 
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
});

const callLlamaAPI = async (promptOrData) => {
    try {
        let messages = [];

        // Logic to construct the messages based on input type
        if (typeof promptOrData === 'string') {
            // Case 1: Direct string prompt (Custom Prompt / Bunk Planner)
            messages = [{ role: "user", content: promptOrData }];
        } else {
            // Case 2: Structured Data object
            const { promptType, data } = promptOrData;

            if (promptType === 'simple_chat') {
                const { query } = data;
                messages = [
                    { 
                        role: "system", 
                        content: "You are a concise academic assistant. Provide a very short, direct answer (max 3-4 sentences). Do not use markdown formatting like bold/italics, just plain text." 
                    },
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
        return await callLlamaAPI({
            promptType: 'simple_chat',
            data: { query }
        });
    };

    const value = { getBunkRecommendation, getResultInsights, askSimpleAI };
    return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};