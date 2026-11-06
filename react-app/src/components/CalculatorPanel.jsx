import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AIContext } from '../context/AIContext.jsx';
import InputForm from './InputForm.jsx';
import Results from './Results.jsx';

const CalculatorPanel = () => {
  const { subjects, attendanceData, selectedSubjects, setSelectedSubjects } = useContext(UserContext);
  const { getResultInsights } = useContext(AIContext);

  const [currentMode, setCurrentMode] = useState('attend-single');
  const [resultsData, setResultsData] = useState(null);
  const [insight, setInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [lastCalcSummary, setLastCalcSummary] = useState('');
  const [staleMessage, setStaleMessage] = useState('');

  const toNumber = (val, defaultVal = 0) => {
    if (val === '' || val === null || val === undefined) return defaultVal;
    const n = Number(val);
    return isNaN(n) ? defaultVal : n;
  };

  const calculateNeededClasses = (att, tot, req) => {
    if (tot < att) return { error: "Attended cannot exceed total classes held." };
    if (tot === 0) return { classesNeeded: 0 };
    const currentPerc = (att / tot) * 100;
    if (currentPerc >= req) return { classesNeeded: 0 };
    const numerator = (req / 100) * tot - att;
    const denominator = 1 - (req / 100);
    if (denominator <= 0) return { classesNeeded: Infinity };
    return { classesNeeded: Math.max(0, Math.ceil(numerator / denominator)) };
  };

  const calculateBunkableClasses = (att, tot, req) => {
    if (tot < att) return { error: "Attended cannot exceed total classes held." };
    if (tot === 0) return { bunkableClasses: 0 };
    const currentPerc = (att / tot) * 100;
    if (currentPerc < req) return { bunkableClasses: 0 };
    const requiredDecimal = req / 100;
    return { bunkableClasses: Math.max(0, Math.floor((att - requiredDecimal * tot) / requiredDecimal)) };
  };

  const handleCalculate = () => {
    setInsight('');
    setStaleMessage(''); 
    const subjectsToCalc = currentMode.includes('all') ? subjects.map((_, i) => i) : selectedSubjects;
    const isBunkMode = currentMode.includes('bunk');
    let summaryValue = 0;
    const skippedSubjects = [];
    let calculatedCount = 0;

    const individualResults = subjectsToCalc.map(index => {
      const data = attendanceData[index] || { attended: '', total: '', requiredPerc: 75 };

      const attendedNum = toNumber(data.attended, 0);
      const totalNum = toNumber(data.total, 0);
      const requiredPercNum = toNumber(data.requiredPerc, 75);

      // Check if subject has 0 total classes recorded
      if (totalNum === 0) {
        skippedSubjects.push(subjects[index]);
        return {
          subjectName: subjects[index],
          attended: 0,
          total: 0,
          requiredPerc: requiredPercNum,
          classesNeeded: 0,
          bunkableClasses: 0,
          isUnrecorded: true
        };
      }

      calculatedCount++;
      const result = isBunkMode
        ? calculateBunkableClasses(attendedNum, totalNum, requiredPercNum)
        : calculateNeededClasses(attendedNum, totalNum, requiredPercNum);

      if (!result.error && result.classesNeeded !== Infinity) {
        summaryValue += result.classesNeeded ?? result.bunkableClasses;
      }

      return {
        subjectName: subjects[index],
        attended: attendedNum,
        total: totalNum,
        requiredPerc: requiredPercNum,
        isUnrecorded: false,
        ...result
      };
    });

    const summaryText = isBunkMode 
      ? `Total bunkable classes: ${summaryValue}` 
      : `Total classes needed: ${summaryValue}`;
    setLastCalcSummary(summaryText);

    setResultsData({
      individualResults,
      skippedSubjects,
      summary: { 
        type: isBunkMode ? 'bunk' : 'attend', 
        value: calculatedCount > 1 ? summaryValue : null 
      },
    });
  };

  const handleGetInsight = async () => {
    setIsInsightLoading(true);
    const prompt = `You are an expert academic advisor. Based on attendance summary: "${lastCalcSummary}", give brief practical tactical recommendations for class attendance, bunk safety, recovery, and test eligibility. Keep advice concise and student-focused.`;
    try {
      const response = await getResultInsights(prompt);
      setInsight(response);
    } catch (e) {
      setInsight("Could not fetch insights. Please try again.");
    }
    setIsInsightLoading(false);
  };

  const modes = [
    { id: 'attend-single', label: 'Attend (Single)', desc: 'Classes needed for chosen course' },
    { id: 'attend-all', label: 'Attend (All)', desc: 'Classes needed for entire catalog' },
    { id: 'bunk-single', label: 'Bunk (Single)', desc: 'Safe bunks for chosen course' },
    { id: 'bunk-all', label: 'Bunk (All)', desc: 'Safe bunks across all courses' },
  ];

  return (
    <div className="flex-1 apple-card p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <i className="fas fa-calculator text-sky-400"></i>
              Attendance & Bunk Forecaster
            </h2>
            <p className="text-xs text-white/50">Run hypothetical simulations to determine class recovery or bunk thresholds.</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {modes.map(m => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setCurrentMode(m.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isActive 
                    ? 'bg-sky-500/15 border-sky-400/40 text-white shadow-sm' 
                    : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold">{m.label}</div>
                <div className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{m.desc}</div>
              </button>
            );
          })}
        </div>

        <InputForm
          subjectsToRender={currentMode.includes('all') ? subjects.map((_, i) => i) : selectedSubjects}
          onEdit={() => {
            if (resultsData) setStaleMessage("Inputs updated. Click 'Run Forecast' to recalculate.");
          }}
        />

        {staleMessage && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <i className="fas fa-info-circle"></i>
            <span>{staleMessage}</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCalculate}
            disabled={(!currentMode.includes('all') && selectedSubjects.length === 0) || subjects.length === 0}
            className="apple-btn-primary text-xs px-6 py-2.5 flex items-center gap-2 disabled:opacity-40"
          >
            <i className="fas fa-calculator text-xs"></i>
            <span>Run Forecast</span>
          </button>
        </div>

        {resultsData && (
          <div className="mt-2">
            <Results
              results={resultsData}
              onGetInsight={handleGetInsight}
              insight={insight}
              isInsightLoading={isInsightLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorPanel;
