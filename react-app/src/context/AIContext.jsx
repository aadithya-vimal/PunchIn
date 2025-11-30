import React, { createContext, useContext } from 'react';
import { UserContext } from './UserContext';
import { functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

export const AIContext = createContext();

// Cloud Function reference
const callGeminiFunction = httpsCallable(functions, 'callGemini');

const callGeminiAPI = async (promptOrData) => {
    try {
        let payload;
        if (typeof promptOrData === 'string') {
            // Legacy support: if a string is passed, use custom_prompt type
            payload = {
                promptType: 'custom_prompt',
                data: { prompt: promptOrData }
            };
        } else {
            // Structured data
            payload = promptOrData;
        }

        const result = await callGeminiFunction(payload);
        const text = result.data.result;

        if (!text) throw new Error("Invalid response from AI.");
        return text;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        return `Error: Could not get a response from the AI. ${error.message}`;
    }
};

export const AIProvider = ({ children }) => {
    const { subjects } = useContext(UserContext);

    const getBunkRecommendation = async (prompt) => {
        if (!prompt) {
            return 'Error: No prompt provided for bunk recommendation.';
        }
        // Supports both string prompt (legacy/custom) and structured object if needed in future
        return await callGeminiAPI(prompt);
    };

    const getStudyPlan = async (goal) => {
        if (!goal.trim()) return "Please enter a study goal.";
        // We can switch to structured call here if we want, but keeping string for consistency with existing logic
        // or we can use the new 'study_planner' type:
        /*
        return await callGeminiAPI({
            promptType: 'study_planner',
            data: { subjects, goal }
        });
        */
        // However, the current prompt in AIContext was:
        const prompt = `My study goal is: "${goal}". My subjects are: ${subjects.join(', ')}. Generate a concise, weekly study plan in Markdown.`;
        return await callGeminiAPI(prompt);
    };

    const getTopicSuggestions = async (subject) => {
        if (!subject) return "Please select a subject.";
        // Using structured call for this one as an example/optimization
        return await callGeminiAPI({
            promptType: 'topic_suggester',
            data: { subject }
        });
    };

    const getResultInsights = async (resultsText) => {
        // Using structured call
        return await callGeminiAPI({
            promptType: 'result_insights',
            data: { resultsText }
        });
    };

    const value = { getBunkRecommendation, getStudyPlan, getTopicSuggestions, getResultInsights };
    return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};