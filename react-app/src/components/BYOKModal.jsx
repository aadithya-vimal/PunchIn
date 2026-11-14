import React, { useState, useContext, useEffect } from 'react';
import { AIContext } from '../context/AIContext.jsx';

const BYOKModal = () => {
  const {
    byokConfig,
    updateBYOK,
    testConnection,
    fetchAvailableModels,
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

  // Custom model typing toggles
  const isDefaultGoogleModel = GOOGLE_MODELS.some(m => m.id === googleModel);
  const [isCustomGoogle, setIsCustomGoogle] = useState(!isDefaultGoogleModel);

  const isDefaultGroqModel = GROQ_TEXT_MODELS.some(m => m.id === groqModel);
  const [isCustomGroq, setIsCustomGroq] = useState(!isDefaultGroqModel);

  const isDefaultGroqVisionModel = GROQ_VISION_MODELS.some(m => m.id === groqVisionModel);
  const [isCustomGroqVision, setIsCustomGroqVision] = useState(!isDefaultGroqVisionModel);

  // Live Fetched Models State
  const [fetchedGoogleModels, setFetchedGoogleModels] = useState([]);
  const [fetchedGroqModels, setFetchedGroqModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);

  // Testing & Save feedback
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handler to fetch live models from Google or Groq
  const handleFetchLiveModels = async (provider, keyToUse) => {
    const key = keyToUse || (provider === PROVIDERS.GOOGLE ? googleApiKey : groqApiKey);
    if (!key || key.trim().length < 5) {
      setFetchStatus({
        provider,
        success: false,
        message: 'Please enter a valid API key first to discover available models.'
      });
      return;
    }

    setIsFetchingModels(true);
    setFetchStatus(null);

    try {
      const models = await fetchAvailableModels(provider, key);
      if (provider === PROVIDERS.GOOGLE) {
        setFetchedGoogleModels(models);
        setFetchStatus({
          provider,
          success: true,
          message: `Discovered ${models.length} active Gemini models for your account & region.`
        });
      } else {
        setFetchedGroqModels(models);
        setFetchStatus({
          provider,
          success: true,
          message: `Discovered ${models.length} active Groq LPU models.`
        });
      }
    } catch (err) {
      setFetchStatus({
        provider,
        success: false,
        message: err.message || 'Failed to fetch live models.'
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleTestKey = async (provider) => {
    setTestingProvider(provider);
    setTestResult(null);

    const key = provider === PROVIDERS.GOOGLE ? googleApiKey : groqApiKey;
    const model = provider === PROVIDERS.GOOGLE ? googleModel : groqModel;

    const result = await testConnection(provider, key, model);
    setTestingProvider(null);
    setTestResult({ provider, ...result });

    // If key tested successfully, auto-fetch available models
    if (result.success) {
      handleFetchLiveModels(provider, key);
    }
  };

  const handleSave = (e) => {
    e?.preventDefault();
    updateBYOK({
      activeProvider: activeTab,
      googleApiKey: googleApiKey.trim(),
      googleModel: googleModel.trim() || 'gemini-2.5-flash',
      groqApiKey: groqApiKey.trim(),
      groqModel: groqModel.trim() || 'llama-3.3-70b-versatile',
      groqVisionModel: groqVisionModel.trim() || 'llama-3.2-11b-vision-preview'
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      closeBYOKModal();
    }, 800);
  };

  const isGoogleConfigured = Boolean(googleApiKey && googleApiKey.trim().length > 5);
  const isGroqConfigured = Boolean(groqApiKey && groqApiKey.trim().length > 5);

  // Combine fetched models with defaults without duplicates
  const allGoogleModels = [
    ...fetchedGoogleModels,
    ...GOOGLE_MODELS.filter(def => !fetchedGoogleModels.some(f => f.id === def.id))
  ];

  const groqTextList = [
    ...fetchedGroqModels.filter(m => !m.vision),
    ...GROQ_TEXT_MODELS.filter(def => !fetchedGroqModels.some(f => f.id === def.id))
  ];

  const groqVisionList = [
    ...fetchedGroqModels.filter(m => m.vision),
    ...GROQ_VISION_MODELS.filter(def => !fetchedGroqModels.some(f => f.id === def.id))
  ];

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
              <p className="text-[11px] text-white/50">Bring Your Own Key, discover live models, or enter custom models</p>
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
                onClick={() => { setActiveTab(PROVIDERS.GOOGLE); setTestResult(null); setFetchStatus(null); }}
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
                onClick={() => { setActiveTab(PROVIDERS.GROQ); setTestResult(null); setFetchStatus(null); }}
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

          {/* GOOGLE GEMINI TAB */}
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

              {/* Gemini Key Input */}
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
                  Stored purely in your local browser storage. Never transmitted to third-party backends.
                </p>
              </div>

              {/* Gemini Model Selection & Custom Typing */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-white/70">
                    Gemini Model ID
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomGoogle(!isCustomGoogle)}
                    className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                  >
                    <i className={`fas ${isCustomGoogle ? 'fa-list' : 'fa-pen-to-square'} text-[9px]`}></i>
                    <span>{isCustomGoogle ? 'Pick from List' : 'Type Custom Model'}</span>
                  </button>
                </div>

                {isCustomGoogle ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={googleModel}
                      onChange={(e) => setGoogleModel(e.target.value)}
                      placeholder="e.g. gemini-2.5-pro, gemini-2.5-flash, gemini-exp-1206..."
                      className="w-full bg-white/5 border border-sky-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-sky-400 transition-colors"
                    />
                    <p className="text-[10px] text-sky-300/80">
                      ✍️ Custom Mode: Enter any newly released Gemini model ID supported by your account.
                    </p>
                  </div>
                ) : (
                  <select
                    value={googleModel}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomGoogle(true);
                      } else {
                        setGoogleModel(e.target.value);
                      }
                    }}
                    className="w-full bg-[#121622] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors select-dark"
                  >
                    {fetchedGoogleModels.length > 0 && (
                      <optgroup label="Live Discovered Models (From Your API Key)">
                        {fetchedGoogleModels.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name || m.id} (Discovered)
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Recommended Gemini Models">
                      {GOOGLE_MODELS.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.badge}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__custom__">✍️ Enter custom model ID by typing...</option>
                  </select>
                )}
              </div>

              {/* Action Buttons: Test Connection & Fetch Live Models */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleTestKey(PROVIDERS.GOOGLE)}
                  disabled={testingProvider === PROVIDERS.GOOGLE || !googleApiKey.trim()}
                  className="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
                >
                  {testingProvider === PROVIDERS.GOOGLE ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs"></i>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plug text-xs text-sky-400"></i>
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleFetchLiveModels(PROVIDERS.GOOGLE)}
                  disabled={isFetchingModels || !googleApiKey.trim()}
                  className="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5 disabled:opacity-40 text-sky-300 border-sky-500/25 hover:bg-sky-500/10"
                  title="Query Google API for the live list of models available to your account"
                >
                  {isFetchingModels ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs"></i>
                      <span>Discovering...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-radar text-xs text-sky-400"></i>
                      <span>Ping & Fetch Live Models</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Fetch Feedback */}
              {fetchStatus && fetchStatus.provider === PROVIDERS.GOOGLE && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  fetchStatus.success
                    ? 'bg-sky-500/10 border border-sky-500/25 text-sky-200'
                    : 'bg-rose-500/10 border border-rose-500/25 text-rose-200'
                }`}>
                  <i className={`fas ${fetchStatus.success ? 'fa-circle-check text-sky-400' : 'fa-circle-exclamation text-rose-400'}`}></i>
                  <span>{fetchStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* GROQ TAB */}
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
                  Free ultra-fast open-weight models hosted on Groq LPU hardware.
                </p>
              </div>

              {/* Groq Chat Model Selector & Custom Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-white/70">
                    Chat & Advisor Model ID
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomGroq(!isCustomGroq)}
                    className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <i className={`fas ${isCustomGroq ? 'fa-list' : 'fa-pen-to-square'} text-[9px]`}></i>
                    <span>{isCustomGroq ? 'Pick from List' : 'Type Custom Model'}</span>
                  </button>
                </div>

                {isCustomGroq ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={groqModel}
                      onChange={(e) => setGroqModel(e.target.value)}
                      placeholder="e.g. llama-3.3-70b-versatile, deepseek-r1-distill-llama-70b..."
                      className="w-full bg-white/5 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-amber-300/80">
                      ✍️ Custom Mode: Enter any active Groq chat model ID.
                    </p>
                  </div>
                ) : (
                  <select
                    value={groqModel}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomGroq(true);
                      } else {
                        setGroqModel(e.target.value);
                      }
                    }}
                    className="w-full bg-[#121622] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors select-dark"
                  >
                    {fetchedGroqModels.length > 0 && (
                      <optgroup label="Live Discovered Groq Models">
                        {groqTextList.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.ownedBy || 'Groq'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Recommended Groq Models">
                      {GROQ_TEXT_MODELS.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.badge}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__custom__">✍️ Enter custom model ID by typing...</option>
                  </select>
                )}
              </div>

              {/* Groq Vision Model Selector & Custom Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-white/70">
                    Vision Model ID (For Screenshots & OCR)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomGroqVision(!isCustomGroqVision)}
                    className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <i className={`fas ${isCustomGroqVision ? 'fa-list' : 'fa-pen-to-square'} text-[9px]`}></i>
                    <span>{isCustomGroqVision ? 'Pick from List' : 'Type Custom Model'}</span>
                  </button>
                </div>

                {isCustomGroqVision ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={groqVisionModel}
                      onChange={(e) => setGroqVisionModel(e.target.value)}
                      placeholder="e.g. llama-3.2-11b-vision-preview, llama-3.2-90b-vision-preview..."
                      className="w-full bg-white/5 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-amber-300/80">
                      ✍️ Custom Mode: Enter any multimodal model supported by Groq.
                    </p>
                  </div>
                ) : (
                  <select
                    value={groqVisionModel}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomGroqVision(true);
                      } else {
                        setGroqVisionModel(e.target.value);
                      }
                    }}
                    className="w-full bg-[#121622] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors select-dark"
                  >
                    {groqVisionList.length > 0 && (
                      <optgroup label="Discovered Vision Models">
                        {groqVisionList.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} (Vision)
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Recommended Vision Models">
                      {GROQ_VISION_MODELS.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.badge}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__custom__">✍️ Enter custom vision model ID by typing...</option>
                  </select>
                )}
              </div>

              {/* Action Buttons: Test Connection & Fetch Live Models */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleTestKey(PROVIDERS.GROQ)}
                  disabled={testingProvider === PROVIDERS.GROQ || !groqApiKey.trim()}
                  className="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
                >
                  {testingProvider === PROVIDERS.GROQ ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs"></i>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plug text-xs text-amber-400"></i>
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleFetchLiveModels(PROVIDERS.GROQ)}
                  disabled={isFetchingModels || !groqApiKey.trim()}
                  className="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5 disabled:opacity-40 text-amber-300 border-amber-500/25 hover:bg-amber-500/10"
                  title="Query Groq API for live available models"
                >
                  {isFetchingModels ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs"></i>
                      <span>Discovering...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-radar text-xs text-amber-400"></i>
                      <span>Ping & Fetch Live Models</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Fetch Feedback */}
              {fetchStatus && fetchStatus.provider === PROVIDERS.GROQ && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  fetchStatus.success
                    ? 'bg-amber-500/10 border border-amber-500/25 text-amber-200'
                    : 'bg-rose-500/10 border border-rose-500/25 text-rose-200'
                }`}>
                  <i className={`fas ${fetchStatus.success ? 'fa-circle-check text-amber-400' : 'fa-circle-exclamation text-rose-400'}`}></i>
                  <span>{fetchStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Test connection feedback */}
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
                <p className="font-semibold">{testResult.success ? 'API Key Validated & Ping Succeeded' : 'Connection Failed'}</p>
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
              Your API keys and model configurations are stored locally in your browser. Any custom or discovered model is pinged directly via official HTTPS endpoints.
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
                <span>Saved & Applied!</span>
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
