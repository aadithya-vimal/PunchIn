import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import {
  loadBYOKConfig,
  saveBYOKConfig,
  hasActiveKey,
  hasAnyKey,
  testConnection,
  generateBYOKCompletion,
  PROVIDERS,
  GOOGLE_MODELS,
  GROQ_TEXT_MODELS,
  GROQ_VISION_MODELS
} from '../services/byokService';
import { analyzeScreenshot } from '../services/screenshotParser';

export const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const { subjects, attendanceData, timetable } = useContext(UserContext);

  const [byokConfig, setByokConfig] = useState(loadBYOKConfig);
  const [isBYOKModalOpen, setIsBYOKModalOpen] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);

  // Sync state if localStorage changes from another tab/window
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'punchin_byok_config') {
        setByokConfig(loadBYOKConfig());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateBYOK = (newValues) => {
    const updated = saveBYOKConfig(newValues);
    setByokConfig(updated);
    return updated;
  };

  const openBYOKModal = () => setIsBYOKModalOpen(true);
  const closeBYOKModal = () => setIsBYOKModalOpen(false);

  const openScreenshotModal = () => setIsScreenshotModalOpen(true);
  const closeScreenshotModal = () => setIsScreenshotModalOpen(false);

  /**
   * Internal generic AI caller using BYOK
   */
  const callBYOKAI = async (promptOrData) => {
    const currentConfig = loadBYOKConfig();
    const isGoogle = currentConfig.activeProvider === PROVIDERS.GOOGLE;
    const activeKey = isGoogle ? currentConfig.googleApiKey : currentConfig.groqApiKey;

    if (!activeKey || activeKey.trim().length === 0) {
      const providerName = isGoogle ? 'Google Gemini' : 'Groq';
      throw new Error(`API key not entered. Please configure your ${providerName} API key in BYOK Settings.`);
    }

    try {
      let messages = [];
      let systemPrompt = '';

      if (typeof promptOrData === 'string') {
        messages = [{ role: 'user', content: promptOrData }];
      } else {
        const { promptType, data } = promptOrData;

        if (promptType === 'simple_chat') {
          const { query, context } = data;
          systemPrompt = `
You are a smart, concise academic assistant for Punch.In Scholar Companion.
Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

USER ACADEMIC DATA CONTEXT:
${context || 'No data available.'}

---
CRITICAL INSTRUCTIONS:
1. NO WALLS OF TEXT: Never repeat the whole timetable or list upcoming classes pointlessly. The user already has the dashboard.
2. ANSWER DIRECTLY: If asked "What happens if I skip...", state the exact result immediately (e.g., "Your overall attendance drops to 78.4%").
3. DO THE MATH: Accurately calculate bunk thresholds, percentage impacts, and date-range attendance.
4. SATURDAY/SUNDAY: If no classes are scheduled for Saturday, treat it as a holiday. Sunday is always a holiday.
---
`;
          messages = [{ role: 'user', content: query }];
        } else if (promptType === 'result_insights') {
          const { resultsText } = data;
          systemPrompt = 'You are an encouraging, mathematically precise college academic advisor.';
          messages = [
            {
              role: 'user',
              content: `Based on this attendance calculation: "${resultsText}", provide 2-3 concise, actionable, and encouraging sentences in plain text.`
            }
          ];
        } else {
          messages = [{ role: 'user', content: JSON.stringify(data) }];
        }
      }

      return await generateBYOKCompletion({
        messages,
        systemPrompt,
        temperature: 0.1,
        maxTokens: 1024
      });
    } catch (error) {
      console.error('AI BYOK Error:', error);
      throw error;
    }
  };

  const getBunkRecommendation = async (prompt) => {
    if (!prompt) return 'Error: No prompt provided.';
    return await callBYOKAI(prompt);
  };

  const getResultInsights = async (resultsText) => {
    return await callBYOKAI({
      promptType: 'result_insights',
      data: { resultsText }
    });
  };

  const askSimpleAI = async (query) => {
    if (!query.trim()) return 'Please enter a question.';

    // 1. Calculate Aggregates
    let totalAttended = 0;
    let totalClasses = 0;

    const formattedAttendance = (subjects || []).map((sub, idx) => {
      const data = attendanceData[idx] || { attended: 0, total: 0 };
      const att = Number(data.attended) || 0;
      const tot = Number(data.total) || 0;
      totalAttended += att;
      totalClasses += tot;
      const pct = tot ? ((att / tot) * 100).toFixed(1) : 0;
      return `${sub}: ${att}/${tot} (${pct}%)`;
    }).join('\n');

    const overallPct = totalClasses ? ((totalAttended / totalClasses) * 100).toFixed(2) : 0;

    // 2. Pre-Calculate "Today's" Impact
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDate = new Date();
    const todayIndex = todayDate.getDay();
    const todayKey = daysOfWeek[todayIndex];
    const todaySchedule = timetable[todayKey] || {};
    const classesTodayCount = Object.values(todaySchedule).filter(val => val !== -1 && val !== '-1').length;

    let mathHint = '';
    if (classesTodayCount > 0) {
      const bunkTotal = totalClasses + classesTodayCount;
      const bunkPct = bunkTotal > 0 ? ((totalAttended / bunkTotal) * 100).toFixed(2) : 0;
      const attendTotal = totalClasses + classesTodayCount;
      const attendAttended = totalAttended + classesTodayCount;
      const attendPct = attendTotal > 0 ? ((attendAttended / attendTotal) * 100).toFixed(2) : 0;

      mathHint = `
[MATH CHEAT SHEET FOR TODAY (${todayKey.toUpperCase()})]:
- Classes Scheduled Today: ${classesTodayCount}
- If BUNK all today: New Overall = ${bunkPct}%
- If ATTEND all today: New Overall = ${attendPct}%
      `;
    }

    // 3. Simplified Timetable
    let scheduleSummary = '';
    daysOfWeek.forEach(day => {
      const count = Object.values(timetable[day] || {}).filter(val => val !== -1 && val !== '-1').length;
      if (count > 0) scheduleSummary += `- ${day.toUpperCase()}: ${count} classes\n`;
    });

    const contextString = `
CURRENT STATS:
Total Attended: ${totalAttended}
Total Classes: ${totalClasses}
Overall %: ${overallPct}%

${mathHint}

WEEKLY SCHEDULE (Classes per day):
${scheduleSummary || 'No classes recorded in schedule.'}

SUBJECT DETAILS:
${formattedAttendance || 'No subjects recorded yet.'}
    `;

    return await callBYOKAI({
      promptType: 'simple_chat',
      data: {
        query,
        context: contextString
      }
    });
  };

  const parseScreenshot = async (args) => {
    return await analyzeScreenshot(args);
  };

  const value = {
    // BYOK Config & State
    byokConfig,
    updateBYOK,
    testConnection,
    hasActiveKey: () => hasActiveKey(byokConfig),
    hasAnyKey: () => hasAnyKey(byokConfig),
    activeProvider: byokConfig.activeProvider,
    
    // Providers & Models metadata
    PROVIDERS,
    GOOGLE_MODELS,
    GROQ_TEXT_MODELS,
    GROQ_VISION_MODELS,

    // Modal Triggers
    isBYOKModalOpen,
    openBYOKModal,
    closeBYOKModal,
    isScreenshotModalOpen,
    openScreenshotModal,
    closeScreenshotModal,

    // AI Functional Callers
    getBunkRecommendation,
    getResultInsights,
    askSimpleAI,
    parseScreenshot
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};
