import React, { useState, useContext } from 'react';
import { AIContext } from '../context/AIContext.jsx';
import { UserContext } from '../context/UserContext.jsx';

const AITopicSuggester = () => {
  const { getTopicSuggestions } = useContext(AIContext);
  const { subjects } = useContext(UserContext);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const res = await getTopicSuggestions(selectedSubject);
    setResult(res);
    setIsLoading(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
      <h2 className="text-3xl font-bold text-gradient mb-4">📚 AI Topic Suggester</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="flex-grow bg-gray-900 border border-white/20 rounded-lg px-4 py-3 text-white select-dark">
          <option value="">-- Select a Subject --</option>
          {subjects.map((subject, index) => (
            <option key={index} value={subject}>{subject}</option>
          ))}
        </select>
        <button onClick={handleClick} disabled={isLoading || !selectedSubject} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center">
          {isLoading ? <i className="fas fa-spinner fa-spin mr-3"></i> : <i className="fas fa-lightbulb mr-3"></i>}
          {isLoading ? 'Suggesting...' : 'Suggest Topics'}
        </button>
      </div>
      <div className="bg-black/20 p-6 rounded-lg min-h-[100px] ai-recommendation-content" dangerouslySetInnerHTML={{ __html: result || "<p>Select a subject to get key topics for study.</p>" }}></div>
    </div>
  );
};
export default AITopicSuggester;