import React, { useState, useContext } from 'react';
import { AIContext } from '../context/AIContext.jsx';

const BYOKModal = () => {
  const {
    byokConfig,
    updateBYOK,
    testConnection,
    closeBYOKModal,
    PROVIDERS,
    GOOGLE_MODELS,
    GROQ_TEXT_MODELS,
    GROQ_VISION_MODELS
  } = useContext(AIContext);

  const [activeTab, setActiveTab] = useState(byokConfig.activeProvider || PROVIDERS.GOOGLE);
  const [googleApiKey, setGoogleApiKey] = useState(byokConfig.googleApiKey || '');
  const [googleModel, setGoogleModel] = useState(byokConfig.googleModel || 'gemini-2.5-flash');

  const [groqApiKey, setGroqApiKey] = useState(byokConfig.groqApiKey || '');
  const [groqModel, setGroqModel] = useState(byokConfig.groqModel || 'llama-3.3-70b-versatile');
  const [groqVisionModel, setGroqVisionModel] = useState(byokConfig.groqVisionModel || 'llama-3.2-11b-vision-preview');

  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);

  // Testing state
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestKey = async (provider) => {
    setTestingProvider(provider);
    setTestResult(null);

    const key = provider === PROVIDERS.GOOGLE ? googleApiKey : groqApiKey;
    const model = provider === PROVIDERS.GOOGLE ? googleModel : groqModel;

    const result = await testConnection(provider, key, model);
    setTestingProvider(null);
    setTestResult({ provider, ...result });
  };

  const handleSave = (e) => {
    e?.preventDefault();
    updateBYOK({
      activeProvider: activeTab,
      googleApiKey: googleApiKey.trim(),
      googleModel,
      groqApiKey: groqApiKey.trim(),
      groqModel,
      groqVisionModel
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      closeBYOKModal();
    }, 800);
  };

  const isGoogleConfigured = Boolean(googleApiKey && googleApiKey.trim().length > 5);
  const isGroqConfigured = Boolean(groqApiKey && groqApiKey.trim().length > 5);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/98 border border-white/15 rounded-3xl p-5 sm:p-7 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center text-base">
              <i className="fas fa-key"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">BYOK Intelligence Setup</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Zero Server Storage
                </span>
              </div>
              <p className="text-[11px] text-white/50">Bring Your Own Key for Google Gemini & Groq models</p>
            </div>
          </div>
          <button 
            onClick={closeBYOKModal} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-xs transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-grow overflow-y-auto pr-1 space-y-4">
          
          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2">
              Select Primary AI Engine
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] border border-white/10 rounded-2xl">
              <button
                type="button"
                onClick={() => { setActiveTab(PROVIDERS.GOOGLE); setTestResult(null); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === PROVIDERS.GOOGLE
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <i className="fab fa-google text-sm"></i>
                <span>Google Gemini</span>
                {isGoogleConfigured && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab(PROVIDERS.GROQ); setTestResult(null); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === PROVIDERS.GROQ
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <i className="fas fa-bolt text-sm"></i>
                <span>Groq Cloud</span>
                {isGroqConfigured && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>
            </div>
          </div>

          {/* Active Tab Configuration */}
          {activeTab === PROVIDERS.GOOGLE && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Google Gemini Configuration</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Multimodal Vision Enabled
                  </span>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Get Free Gemini Key</span>
                  <i className="fas fa-external-link-alt text-[9px]"></i>
                </a>
              </div>

              {/* Key Input */}
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1.5">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showGoogleKey ? 'text' : 'password'}
                    value={googleApiKey}
                    onChange={(e) => setGoogleApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-white/30 font-mono focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleKey(!showGoogleKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 text-xs"
                  >
                    <i className={`fas ${showGoogleKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <p className="text-[10px] text-white/40 mt-1">
                  Obtained free of cost with a personal Google account via Google AI Studio.
                </p>
              </div>

              {/* Model Selector */}
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1.5">
                  Default Gemini Model
                </label>
                <select
                  value={googleModel}
                  onChange={(e) => setGoogleModel(e.target.value)}
                  className="w-full bg-[#121622] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors select-dark"
                >
                  {GOOGLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.badge}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Connection Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleTestKey(PROVIDERS.GOOGLE)}
                  disabled={testingProvider === PROVIDERS.GOOGLE || !googleApiKey.trim()}
                  className="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-2 disabled:opacity-40"
                >
                  {testingProvider === PROVIDERS.GOOGLE ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs"></i>
                      <span>Verifying Key...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plug text-xs"></i>
                      <span>Test Connection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === PROVIDERS.GROQ && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Groq Cloud Configuration</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    LPU Ultra-Fast Inference
                  </span>
                </div>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Get Free Groq Key</span>
                  <i className="fas fa-external-link-alt text-[9px]"></i>
                </a>
              </div>

              {/* Groq Key Input */}
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1.5">
                  Groq API Key
                </label>
                <div className="relative">
                  <input
                    type={showGroqKey ? 'text' : 'password'}
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-white/30 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 text-xs"
                  >
                    <i className={`fas ${showGroqKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <p className="text-[10px] text-white/40 mt-1">
                  Free ultra-fast open-weight models hosted on Groq LPU inference hardware.
                </p>
              </div>

              {/* Groq Text Model Selector */}
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1.5">
                  Chat & Strategist Model
                </label>
                <select
                  value={groqModel}
                  onChange={(e) => setGroqModel(e.target.value)}
                  className="w-full bg-[#121622] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors select-dark"
                >
                  {GROQ_TEXT_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.badge}
                    </option>
                  ))}
                </select>
              </div>

              {/* Groq Vision Model Selector */}
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1.5">
                  Vision Model (For Screenshots & OCR)
                </label>
                <select
                  value={groqVisionModel}
                  onChange={(e) => setGroqVisionModel(e.target.value)}
                  className="w-full bg-[#121622] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors select-dark"
                >
                  {GROQ_VISION_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.badge}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Connection Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleTestKey(PROVIDERS.GROQ)}
                  disabled={testingProvider === PROVIDERS.GROQ || !groqApiKey.trim()}
                  className="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-2 disabled:opacity-40"
                >
                  {testingProvider === PROVIDERS.GROQ ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs"></i>
                      <span>Verifying Key...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plug text-xs"></i>
                      <span>Test Connection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Test feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                testResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-200'
              }`}
            >
              <i className={`fas ${testResult.success ? 'fa-check-circle text-emerald-400' : 'fa-exclamation-triangle text-rose-400'} text-sm mt-0.5`}></i>
              <div className="flex-1">
                <p className="font-semibold">{testResult.success ? 'API Key Validated Successfully' : 'Connection Failed'}</p>
                <p className="text-[11px] opacity-80 mt-0.5">{testResult.message || testResult.error}</p>
              </div>
            </div>
          )}

          {/* Zero-Knowledge Security Notice */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-white/50 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-white/70">
              <i className="fas fa-shield-halved text-sky-400"></i>
              <span>Zero-Intermediary Privacy</span>
            </div>
            <p className="leading-relaxed">
              Your API keys are stored solely in your personal browser's LocalStorage and sent directly to Google / Groq via official encrypted endpoints. Punch.In operates in pure BYOK mode with no external tracking or token harvesting.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4 flex-shrink-0">
          <button
            type="button"
            onClick={closeBYOKModal}
            className="apple-btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="apple-btn-primary text-xs px-6 py-2 flex items-center gap-2"
          >
            {saveSuccess ? (
              <>
                <i className="fas fa-check"></i>
                <span>Saved!</span>
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                <span>Save & Set Active</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BYOKModal;
