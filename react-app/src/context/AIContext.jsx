import React, { createContext, useContext } from 'react';
import { UserContext } from './UserContext';
// import { marked } from 'marked'; // --- This was removed in a previous step to fix XSS

export const AIContext = createContext();

// !! DANGER: YOUR API KEY WAS EXPOSED !!
// I have removed the hardcoded key. You MUST delete that key from your Google Cloud console.
//
// This key should NOT be stored on the client. For this to be secure,
// you MUST build a backend (e.g., a Cloud Function) that holds the key
// and makes the API call.
//
// As a temporary measure, you can add VITE_GEMINI_API_KEY="your_new_key"
// to your .env.local file, but this is still insecure and not for production.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const callGeminiAPI = async (prompt) => {
    if (!API_KEY) {
        return `Error: Gemini API Key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file. For production, this MUST be moved to a secure backend.`;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Invalid response from AI.");
        
        // --- FIX: Return raw text, not parsed HTML (from XSS fix) ---
        return text;
        
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return `Error: Could not get a response from the AI. ${error.message}`;
    }
};

export const AIProvider = ({ children }) => {
    const { subjects, timetable } = useContext(UserContext);

    const getBunkRecommendation = async (prompt) => {
        if (!prompt || typeof prompt !== 'string') {
            return '<p>Error: No prompt provided for bunk recommendation.</p>';
        }
        return await callGeminiAPI(prompt);
    };

    const getStudyPlan = async (goal) => {
        if (!goal.trim()) return "<p>Please enter a study goal.</p>";
        const prompt = `My study goal is: "${goal}". My subjects are: ${subjects.join(', ')}. Generate a concise, weekly study plan in Markdown.`;
        return await callGeminiAPI(prompt);
    };

    const getTopicSuggestions = async (subject) => {
        if (!subject) return "<p>Please select a subject.</p>";
        const prompt = `I am studying '${subject}'. Suggest 5 key topics to focus on. Provide a one-sentence description for each.`;
        return await callGeminiAPI(prompt);
    };
    
    const getResultInsights = async (resultsText) => {
        // --- FIX: Modified prompt to ask for plain text, not Markdown (from XSS fix) ---
        const prompt = `Based on this calculation result: "${resultsText}", provide 2-3 sentences of encouraging, actionable advice in plain text.`;
        return await callGeminiAPI(prompt);
    };

    const value = { getBunkRecommendation, getStudyPlan, getTopicSuggestions, getResultInsights };
    return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};