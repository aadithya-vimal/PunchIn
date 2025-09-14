import React, { useState, useContext } from 'react';
import { AIContext } from '../context/AIContext.jsx';
import { UserContext } from '../context/UserContext.jsx';

const AIAssistant = () => {
  const { getBunkRecommendation } = useContext(AIContext);
  const { attendanceData, subjects, timetable } = useContext(UserContext);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const daySummaries = daysOfWeek.map(day => {
      const dayTimetable = timetable?.[day] || {};
      const subjectsToday = Object.values(dayTimetable)
        .map(idx => subjects[idx])
        .filter(Boolean);

      const attendanceSummary = subjectsToday.map(subject => {
        const idx = subjects.indexOf(subject);
        const data = attendanceData[idx] || { attended: 0, total: 0 };
        const perc = data.total ? ((data.attended / data.total) * 100).toFixed(1) : 'N/A';
        return `${subject} (${perc}%)`;
      }).join(', ') || 'No classes today';

      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${attendanceSummary}`;
    }).join('; ');

    const prompt = `
You are an expert educational planner who provides detailed attendance and bunk day insights.

Please perform the following tasks in sequence:

1. Check the official holiday calendar for India for the next 3 months. List all holidays and long weekends.
2. Identify all working days that fall between these holidays and weekends and can be potential extended breaks.
3. Analyze the user's weekly timetable and attendance percentages given below.
4. Recommend multiple optimal days for bunking that do not put attendance requirements at risk.
5. For each recommended day, provide detailed insights including:
   - Which subjects might be affected by bunking that day.
   - The risk of dropping attendance below requirements.
   - How many days can be saved with minimal impact.
6. Suggest personalized strategies to improve overall attendance for subjects where attendance is low.
7. Provide a balanced action plan that optimizes attendance with reasonable bunking for breaks.

User Timetable and Attendance Summary:
${daySummaries}

Provide a detailed, step-by-step, multi-point structured response with examples and explanations.
`;

    try {
      const res = await getBunkRecommendation(prompt);
      setResult(res);
    } catch (error) {
      setResult('Error fetching AI recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gradient mb-4 md:mb-0">✨ AI Bunk Planner – Detailed Insights</h2>
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center"
        >
          {isLoading 
            ? <i className="fas fa-spinner fa-spin mr-3"></i> 
            : <i className="fas fa-brain mr-3"></i>}
          {isLoading ? 'Analyzing...' : 'Get Insights & Bunk Plan'}
        </button>
      </div>
      <div
        className="bg-black/20 p-6 rounded-lg min-h-[100px] text-white/80 leading-relaxed whitespace-pre-wrap ai-recommendation-content"
        dangerouslySetInnerHTML={{ __html: result || "<p>Click the button to get detailed AI-powered bunk insights...</p>" }}
      />
    </div>
  );
};

export default AIAssistant;
