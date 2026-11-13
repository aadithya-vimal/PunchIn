// Punch.In BYOK (Bring Your Own Key) Service
// Direct client-side calls to Google Gemini and Groq APIs

const STORAGE_KEY = 'punchin_byok_config';

export const PROVIDERS = {
  GOOGLE: 'google',
  GROQ: 'groq'
};

export const GOOGLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Recommended', vision: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', badge: 'Fast & Multimodal', vision: true },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Legacy Fast', vision: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', badge: 'Deep Reasoning', vision: true }
];

export const GROQ_TEXT_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', badge: 'Recommended', vision: false },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', badge: 'Ultra Fast', vision: false },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile', badge: 'Strong Chat', vision: false },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32k)', badge: 'Long Context', vision: false }
];

export const GROQ_VISION_MODELS = [
  { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B Vision', badge: 'Fast Vision', vision: true },
  { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', badge: 'High Accuracy', vision: true }
];

const DEFAULT_CONFIG = {
  activeProvider: PROVIDERS.GOOGLE,
  googleApiKey: '',
  googleModel: 'gemini-2.5-flash',
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  groqVisionModel: 'llama-3.2-11b-vision-preview'
};

/**
 * Load BYOK configuration from localStorage, with optional environment variable fallbacks
 */
export const loadBYOKConfig = () => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const parsed = raw ? JSON.parse(raw) : {};

    // Check for Vite environment variables as initial fallbacks if not set
    const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
    const envGoogle = metaEnv.VITE_GEMINI_API_KEY || metaEnv.VITE_GOOGLE_API_KEY || '';
    const envGroq = metaEnv.VITE_GROQ_API_KEY || '';

    const config = {
      ...DEFAULT_CONFIG,
      ...parsed,
      googleApiKey: parsed.googleApiKey || envGoogle,
      groqApiKey: parsed.groqApiKey || envGroq
    };

    // If active provider key is empty but the other key is filled, auto-switch active provider
    if (config.activeProvider === PROVIDERS.GOOGLE && !config.googleApiKey && config.groqApiKey) {
      config.activeProvider = PROVIDERS.GROQ;
    } else if (config.activeProvider === PROVIDERS.GROQ && !config.groqApiKey && config.googleApiKey) {
      config.activeProvider = PROVIDERS.GOOGLE;
    }

    return config;
  } catch (e) {
    console.error('Error loading BYOK config:', e);
    return { ...DEFAULT_CONFIG };
  }
};

/**
 * Save BYOK configuration to localStorage
 */
export const saveBYOKConfig = (newConfig) => {
  try {
    const current = loadBYOKConfig();
    const merged = { ...current, ...newConfig };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (e) {
    console.error('Error saving BYOK config:', e);
    return newConfig;
  }
};

/**
 * Check if the active provider has a valid key configured
 */
export const hasActiveKey = (config = loadBYOKConfig()) => {
  if (config.activeProvider === PROVIDERS.GOOGLE) {
    return Boolean(config.googleApiKey && config.googleApiKey.trim().length > 5);
  }
  if (config.activeProvider === PROVIDERS.GROQ) {
    return Boolean(config.groqApiKey && config.groqApiKey.trim().length > 5);
  }
  return false;
};

/**
 * Check if at least one provider has a key configured
 */
export const hasAnyKey = (config = loadBYOKConfig()) => {
  return Boolean(
    (config.googleApiKey && config.googleApiKey.trim().length > 5) ||
    (config.groqApiKey && config.groqApiKey.trim().length > 5)
  );
};

/**
 * Test API key connectivity and latency for a specific provider
 */
export const testConnection = async (provider, apiKey, modelId) => {
  const startTime = performance.now();
  
  if (!apiKey || apiKey.trim().length < 5) {
    return { success: false, error: 'API key is missing or too short.' };
  }

  try {
    if (provider === PROVIDERS.GOOGLE) {
      const model = modelId || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with "PUNCHIN_OK" in 1 word.' }] }],
          generationConfig: { maxOutputTokens: 10, temperature: 0 }
        })
      });

      const data = await res.json();
      const latency = Math.round(performance.now() - startTime);

      if (!res.ok || data.error) {
        const msg = data.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        return { success: false, error: msg, latency };
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { success: true, message: `Connected (${latency}ms) - Model: ${model}`, latency, response: text.trim() };
    } 
    
    if (provider === PROVIDERS.GROQ) {
      const model = modelId || 'llama-3.1-8b-instant';
      const url = 'https://api.groq.com/openai/v1/chat/completions';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Respond with "PUNCHIN_OK" in 1 word.' }],
          max_tokens: 10,
          temperature: 0
        })
      });

      const data = await res.json();
      const latency = Math.round(performance.now() - startTime);

      if (!res.ok || data.error) {
        const msg = data.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        return { success: false, error: msg, latency };
      }

      const text = data.choices?.[0]?.message?.content || '';
      return { success: true, message: `Connected (${latency}ms) - Model: ${model}`, latency, response: text.trim() };
    }

    return { success: false, error: 'Unknown provider.' };
  } catch (err) {
    const latency = Math.round(performance.now() - startTime);
    return { success: false, error: err.message || 'Network request failed', latency };
  }
};

/**
 * Generate text completion using the active BYOK provider
 */
export const generateBYOKCompletion = async ({
  messages = [],
  systemPrompt = '',
  temperature = 0.2,
  maxTokens = 2048,
  overrideProvider = null
}) => {
  const config = loadBYOKConfig();
  const provider = overrideProvider || config.activeProvider;

  if (provider === PROVIDERS.GOOGLE) {
    if (!config.googleApiKey || config.googleApiKey.trim().length === 0) {
      throw new Error('API key not entered. Please configure your Google Gemini API key in BYOK Settings.');
    }

    const model = config.googleModel || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.googleApiKey.trim()}`;

    // Convert standard OpenAI-style messages to Gemini format
    const contents = [];
    let sysInstruction = systemPrompt;

    for (const msg of messages) {
      if (msg.role === 'system') {
        sysInstruction = msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Ensure there is at least one content part
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const body = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    };

    if (sysInstruction) {
      body.system_instruction = { parts: [{ text: sysInstruction }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const errorMsg = data.error?.message || `Google API Error (${res.status})`;
      if (res.status === 400 && errorMsg.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Google Gemini API key. Please check or re-enter your key in BYOK Settings.');
      }
      if (res.status === 429) {
        throw new Error('Google Gemini rate limit / quota exceeded. Please try again shortly or switch to Groq.');
      }
      throw new Error(errorMsg);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  }

  if (provider === PROVIDERS.GROQ) {
    if (!config.groqApiKey || config.groqApiKey.trim().length === 0) {
      throw new Error('API key not entered. Please configure your Groq API key in BYOK Settings.');
    }

    const model = config.groqModel || 'llama-3.3-70b-versatile';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const formattedMessages = [];
    if (systemPrompt && !messages.some(m => m.role === 'system')) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    formattedMessages.push(...messages);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.groqApiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature,
        max_tokens: maxTokens
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const errorMsg = data.error?.message || `Groq API Error (${res.status})`;
      if (res.status === 401 || errorMsg.includes('Invalid API Key') || errorMsg.includes('invalid_api_key')) {
        throw new Error('Invalid Groq API key. Please check or re-enter your key in BYOK Settings.');
      }
      if (res.status === 429) {
        throw new Error('Groq rate limit exceeded. Please wait a moment or switch to Gemini.');
      }
      throw new Error(errorMsg);
    }

    return data.choices?.[0]?.message?.content || 'No response generated.';
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
};

/**
 * Analyze an image with Vision AI (Google Gemini or Groq Vision)
 */
export const analyzeBYOKVision = async ({
  imageBase64,
  mimeType = 'image/png',
  prompt,
  systemPrompt = ''
}) => {
  const config = loadBYOKConfig();
  
  // Decide provider for vision:
  // If active is Google and has key -> use Google (world-class vision)
  // If active is Groq and has key -> use Groq Vision model
  // If one of them has a key and the other doesn't, pick the configured one
  let provider = config.activeProvider;
  if (provider === PROVIDERS.GROQ && !config.groqApiKey && config.googleApiKey) {
    provider = PROVIDERS.GOOGLE;
  } else if (provider === PROVIDERS.GOOGLE && !config.googleApiKey && config.groqApiKey) {
    provider = PROVIDERS.GROQ;
  }

  // Clean base64 string if it contains data prefix
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

  if (provider === PROVIDERS.GOOGLE) {
    if (!config.googleApiKey || config.googleApiKey.trim().length === 0) {
      throw new Error('API key not entered. Please configure your Google Gemini API key in BYOK Settings.');
    }

    const model = config.googleModel || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.googleApiKey.trim()}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json'
      }
    };

    if (systemPrompt) {
      body.system_instruction = { parts: [{ text: systemPrompt }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error?.message || `Google Vision Error (${res.status})`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  }

  if (provider === PROVIDERS.GROQ) {
    if (!config.groqApiKey || config.groqApiKey.trim().length === 0) {
      throw new Error('API key not entered. Please configure your Groq API key in BYOK Settings.');
    }

    const visionModel = config.groqVisionModel || 'llama-3.2-11b-vision-preview';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${cleanBase64}`
          }
        }
      ]
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.groqApiKey.trim()}`
      },
      body: JSON.stringify({
        model: visionModel,
        messages,
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error?.message || `Groq Vision Error (${res.status})`);
    }

    return data.choices?.[0]?.message?.content || '{}';
  }

  throw new Error('Please configure either a Google Gemini or Groq API key to use Vision scanning.');
};
