import React, { useState, useContext } from 'react';
import { AIContext } from '../context/AIContext.jsx';

const AskAI = () => {
  const {
    askSimpleAI,
    byokConfig,
    hasActiveKey,
    openBYOKModal,
    PROVIDERS
  } = useContext(AIContext);

  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isConfigured = hasActiveKey();
  const isGoogle = byokConfig.activeProvider === PROVIDERS.GOOGLE;
  const activeModelDisplay = isGoogle
    ? `Gemini: ${byokConfig.googleModel || 'gemini-2.5-flash'}`
    : `Groq: ${byokConfig.groqModel || 'llama-3.3-70b'}`;

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse('');
    setErrorMsg('');

    try {
      const res = await askSimpleAI(query);
      setResponse(res);
    } catch (error) {
      console.error('AskAI Error:', error);
      setErrorMsg(error.message || 'Could not retrieve AI response at this moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const errLower = (errorMsg || '').toLowerCase();
  const isKeyMissingError = errLower.includes('key not entered') || errLower.includes('api key is missing') || errLower.includes('configure your');
  const isModelError = errLower.includes('model') && (errLower.includes('not found') || errLower.includes('deprecated') || errLower.includes('unavailable') || errLower.includes('404'));
  const isQuotaError = errLower.includes('quota') || errLower.includes('rate limit') || errLower.includes('429');

  const errorButtonText = isKeyMissingError
    ? 'Enter API Key'
    : isModelError
    ? 'Select / Ping Model'
    : isQuotaError
    ? 'Switch Provider'
    : 'BYOK Settings';

  return (
    <div className="apple-card p-5 sm:p-6 mb-8 border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
            <i className="fas fa-brain"></i>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">AI Academic Strategist</h3>
            <p className="text-[11px] text-white/50">Ask quick questions regarding test criteria, exam eligibility, or schedule advice</p>
          </div>
        </div>

        {/* BYOK Provider Pill */}
        <button
          type="button"
          onClick={openBYOKModal}
          className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 transition-colors ${
            isConfigured
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
          title="Configure BYOK Key and Model"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-sky-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span>{isConfigured ? activeModelDisplay : 'Setup BYOK Key'}</span>
          <i className="fas fa-sliders-h text-[8px] opacity-70"></i>
        </button>
      </div>

      {/* Query Form - Always Accessible in BYOK Mode */}
      <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2 mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isConfigured ? "e.g. Can I skip tomorrow's classes and still stay above 75%?" : "Ask AI Advisor (e.g. Can I skip tomorrow's classes?)..."}
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
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane text-xs"></i>
              <span>Ask Advisor</span>
            </>
          )}
        </button>
      </form>

      {/* Proper Actionable Error Message Alert Box */}
      {errorMsg && (
        <div className={`mt-4 p-4 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150 ${
          isKeyMissingError
            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
            : isModelError
            ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-200'
            : 'bg-rose-500/10 border border-rose-500/25 text-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <i className={`fas ${
              isKeyMissingError 
                ? 'fa-key text-amber-400 text-sm' 
                : isModelError
                ? 'fa-microchip text-indigo-400 text-sm'
                : 'fa-exclamation-circle text-rose-400 text-sm'
            }`}></i>
            <div>
              <p className="font-semibold text-white">
                {isKeyMissingError 
                  ? 'API Key Not Configured' 
                  : isModelError
                  ? 'Model Unavailable or Not Found'
                  : isQuotaError
                  ? 'Rate Limit / Quota Exceeded'
                  : 'AI Request Failed'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openBYOKModal}
            className="apple-btn-primary text-xs px-3.5 py-1.5 shrink-0 self-end sm:self-auto flex items-center gap-1.5"
          >
            <i className="fas fa-sliders-h text-[10px]"></i>
            <span>{errorButtonText}</span>
          </button>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/90 leading-relaxed border-l-2 border-l-sky-400 animate-in fade-in duration-200">
          {response}
        </div>
      )}
    </div>
  );
};

export default AskAI;
