import React, { useState, useContext } from 'react';
import { AIContext } from '../context/AIContext.jsx';

const AIStudyPlanner = () => {
  const { getStudyPlan } = useContext(AIContext);
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const res = await getStudyPlan(goal);
    setResult(res);
    setIsLoading(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
      <h2 className="text-3xl font-bold text-gradient mb-4">✨ AI Study Planner</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter your study goal (e.g., 'Prepare for mid-terms in 2 weeks')"
          className="flex-grow bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
        />
        <button onClick={handleClick} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center">
          {isLoading ? <i className="fas fa-spinner fa-spin mr-3"></i> : <i className="fas fa-book-reader mr-3"></i>}
          {isLoading ? 'Generating...' : 'Generate Study Plan'}
        </button>
      </div>
      <div className="bg-black/20 p-6 rounded-lg min-h-[100px] ai-recommendation-content" dangerouslySetInnerHTML={{ __html: result || "<p>Enter a goal and get a personalized study schedule.</p>" }}></div>
    </div>
  );
};
export default AIStudyPlanner;