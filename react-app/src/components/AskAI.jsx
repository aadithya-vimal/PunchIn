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
    setResponse('');
    try {
      const res = await askSimpleAI(query);
      setResponse(res);
    } catch (error) {
      setResponse("Could not retrieve AI response at this moment. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="apple-card p-5 sm:p-6 mb-8 border-white/10">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
          <i className="fas fa-brain"></i>
        </div>
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">AI Academic Strategist</h3>
          <p className="text-[11px] text-white/50">Ask quick questions regarding test criteria, exam eligibility, or schedule advice</p>
        </div>
      </div>
      
      <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2 mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. How to maintain 75% with 2 labs per week?"
          className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="apple-btn-primary text-xs px-5 py-2.5 flex items-center justify-center gap-2 disabled:opacity-40 shrink-0"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin text-xs"></i>
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane text-xs"></i>
              <span>Ask Advisor</span>
            </>
          )}
        </button>
      </form>

      {response && (
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/90 leading-relaxed border-l-2 border-l-sky-400 animate-in fade-in duration-200">
          {response}
        </div>
      )}
    </div>
  );
};

export default AskAI;
