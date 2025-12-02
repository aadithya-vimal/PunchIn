import React, { useState, useContext } from 'react';
import { AIContext } from '../context/AIContext.jsx';

const AskAI = () => {
  const { askSimpleAI } = useContext(AIContext);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResponse(''); // Clear previous
    try {
      const res = await askSimpleAI(query);
      setResponse(res);
    } catch (error) {
      setResponse("Sorry, I couldn't fetch an answer right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-8 mx-auto border border-white/10">
      <div className="flex items-center gap-2 mb-3">
         <span className="text-xl">🤖</span>
         <h3 className="font-bold text-white text-lg">Quick AI Assist</h3>
         <span className="text-xs text-white/50 ml-auto">Powered by Gemini Flash</span>
      </div>
      
      <form onSubmit={handleAsk} className="flex gap-2 mb-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a quick academic question..."
          className="flex-grow bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {response && (
        <div className="mt-3 bg-black/20 rounded-lg p-3 text-sm text-white/90 border-l-4 border-indigo-500 animate-in fade-in slide-in-from-top-1 duration-300">
          {response}
        </div>
      )}
    </div>
  );
};

export default AskAI;