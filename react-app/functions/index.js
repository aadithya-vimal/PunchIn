const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// Define the API key as a secret or param, but for simplicity in this setup we'll use process.env
// In a production environment, use defineSecret("GEMINI_API_KEY")
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.callGemini = onCall({ cors: true }, async (request) => {
    if (!GEMINI_API_KEY) {
        throw new HttpsError("failed-precondition", "Gemini API key is not configured.");
    }

    const { promptType, data } = request.data;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        let prompt = "";

        if (promptType === "bunk_planner") {
            const { attendanceData, criteria } = data;
            prompt = `
        Act as a strategic bunk planner for a student.
        Here is my current attendance data: ${JSON.stringify(attendanceData)}
        My criteria for bunking: ${JSON.stringify(criteria)}
        
        Analyze this and tell me:
        1. Which subjects can I safely bunk?
        2. How many classes can I miss for each?
        3. What is the best day to take a leave (bunk the whole day)?
        4. Any warnings if I am close to the danger zone (75%).
        
        Keep the response concise, fun, and actionable. Use bullet points.
      `;
        } else if (promptType === "study_planner") {
            const { subjects, goal } = data;
            prompt = `
        Create a study plan for the following subjects: ${JSON.stringify(subjects)}.
        My goal is: "${goal}".
        Allocate time based on urgency and provide a daily schedule.
      `;
        } else if (promptType === "topic_suggester") {
            const { subject } = data;
            prompt = `
        Suggest 5 interesting and important topics to study for the subject: ${subject}.
        Focus on high-yield concepts often asked in exams.
      `;
        } else if (promptType === "result_insights") {
            const { resultsText } = data;
            prompt = `Based on this calculation result: "${resultsText}", provide 2-3 sentences of encouraging, actionable advice in plain text.`;
        } else if (promptType === "group_bunk_planner") {
            const { memberData } = data;
            prompt = `
         Analyze the attendance data for this group of students: ${JSON.stringify(memberData)}.
         Find the best common day to bunk where everyone is safe (or minimal risk).
         Suggest a specific day of the week and explain why.
         Keep it fun and collaborative.
       `;
        } else if (promptType === "custom_prompt") {
            prompt = data.prompt;
        } else {
            throw new HttpsError("invalid-argument", "Unknown prompt type.");
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return { result: text };
    } catch (error) {
        console.error("Error calling Gemini:", error);
        throw new HttpsError("internal", "Failed to generate content from Gemini.", error);
    }
});
