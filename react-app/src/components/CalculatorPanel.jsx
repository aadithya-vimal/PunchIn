import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AIContext } from '../context/AIContext.jsx';
import InputForm from './InputForm.jsx';
import Results from './Results.jsx';
import StyledButton from './StyledButton.jsx';

import { AcademicCapIcon, UsersIcon, CheckBadgeIcon, HomeIcon } from '@heroicons/react/24/solid';

const ButtonContent = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center">
    {Icon && <Icon className="w-8 h-8 mb-2" aria-hidden="true" />}
    <span className="text-lg font-semibold">{title}</span>
    <small className="text-xs text-gray-300 mt-1 text-center">{description}</small>
  </div>
);

const CalculatorPanel = () => {
  const { subjects, attendanceData, selectedSubjects, setSelectedSubjects, updateAttendanceData } = useContext(UserContext);
  const { getResultInsights } = useContext(AIContext);

  const [currentMode, setCurrentMode] = useState('attend-single');
  const [resultsData, setResultsData] = useState(null);
  const [insight, setInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [lastCalcSummary, setLastCalcSummary] = useState('');
  const [inputFormKey, setInputFormKey] = useState(Date.now());
  const [staleMessage, setStaleMessage] = useState('');

  const toNumber = (str, defaultVal = 0) => {
    const n = Number(str);
    return isNaN(n) ? defaultVal : n;
  };

  const calculateNeededClasses = (att, tot, req) => {
    if (tot < att) return { error: "Attended cannot be more than total." };
    const currentPerc = tot > 0 ? (att / tot) * 100 : 101;
    if (currentPerc >= req) return { classesNeeded: 0 };
    const numerator = (req / 100) * tot - att;
    const denominator = 1 - (req / 100);
    if (denominator <= 0) return { classesNeeded: Infinity };
    return { classesNeeded: Math.max(0, Math.ceil(numerator / denominator)) };
  };

  const calculateBunkableClasses = (att, tot, req) => {
    if (tot < att) return { error: "Attended cannot be more than total." };
    const currentPerc = tot > 0 ? (att / tot) * 100 : 101;
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

    const individualResults = subjectsToCalc.map(index => {
      const data = attendanceData[index] || { attended: '', total: '', requiredPerc: '75' };

      const attendedNum = toNumber(data.attended);
      const totalNum = toNumber(data.total);
      const requiredPercNum = toNumber(data.requiredPerc, 75);

      const result = isBunkMode
        ? calculateBunkableClasses(attendedNum, totalNum, requiredPercNum)
        : calculateNeededClasses(attendedNum, totalNum, requiredPercNum);

      if (!result.error && result.classesNeeded !== Infinity) {
        summaryValue += result.classesNeeded ?? result.bunkableClasses;
      }

      return { subjectName: subjects[index], attended: attendedNum, total: totalNum, requiredPerc: requiredPercNum, ...result };
    });

    const summaryText = isBunkMode ? `Total bunkable classes: ${summaryValue}` : `Total classes needed: ${summaryValue}`;
    setLastCalcSummary(summaryText);
    setResultsData({
      individualResults,
      summary: { type: isBunkMode ? 'bunk' : 'attend', value: individualResults.length > 1 ? summaryValue : null },
    });

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 200);
  };

  const handleGetInsight = async () => {
    setIsInsightLoading(true);

    const prompt = `
You are an expert educational planner.

Given these attendance stats: ${lastCalcSummary} and subject-wise data, provide a detailed, specific bunk day plan.
Discuss risks, best days, continuous breaks, and personalized attendance strategies.
Avoid vague generalities; be practical and focused on the user's data.

${JSON.stringify(resultsData, null, 2)}
`;

    const res = await getResultInsights(prompt);

    setInsight(res);
    setIsInsightLoading(false);
  };

  const handleClear = () => {
    setSelectedSubjects([]);       
    setResultsData(null);          
    setInsight('');                
    setStaleMessage('');           
    setInputFormKey(Date.now());  
  };

  const handleModeChange = (newMode) => {
      setCurrentMode(newMode);
      setResultsData(null);
      setStaleMessage('');
      setInsight('');
  }

  const handleDataEdit = () => {
    if (resultsData || insight) {
      setResultsData(null);
      setInsight('');
      setStaleMessage("Data modified. Press 'Calculate' again.");
    }
  };

  const subjectsToRender = currentMode.includes('all') ? subjects.map((_, i) => i) : selectedSubjects;

  return (
    <>
      <div className="lg:w-3/4 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Select Calculation Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 mb-10" style={{ gap: '0.5rem' }}>
            <StyledButton
              active={currentMode === 'attend-single'}
              onClick={() => handleModeChange('attend-single')}
              className="px-6 py-4 text-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:text-indigo-50 rounded-xl"
              style={{ margin: '0.25rem', transformOrigin: 'center' }}
            >
              <ButtonContent
                icon={AcademicCapIcon}
                title="Selected Subjects Attendance"
                description="Calculate how many more classes needed for selected subjects to meet attendance"
              />
            </StyledButton>

            <StyledButton
              active={currentMode === 'attend-all'}
              onClick={() => handleModeChange('attend-all')}
              className="px-6 py-4 text-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:text-indigo-50 rounded-xl"
              style={{ margin: '0.25rem', transformOrigin: 'center' }}
            >
              <ButtonContent
                icon={UsersIcon}
                title="All Subjects Attendance"
                description="Calculate total classes needed across all subjects"
              />
            </StyledButton>

            <StyledButton
              active={currentMode === 'bunk-single'}
              onClick={() => handleModeChange('bunk-single')}
              className="px-6 py-4 text-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:text-indigo-50 rounded-xl"
              style={{ margin: '0.25rem', transformOrigin: 'center' }}
            >
              <ButtonContent
                icon={CheckBadgeIcon}
                title="Selected Subjects Bunk"
                description="Calculate how many classes you can bunk without attendance falling below required"
              />
            </StyledButton>

            <StyledButton
              active={currentMode === 'bunk-all'}
              onClick={() => handleModeChange('bunk-all')}
              className="px-6 py-4 text-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:text-indigo-50 rounded-xl"
              style={{ margin: '0.25rem', transformOrigin: 'center' }}
            >
              <ButtonContent
                icon={HomeIcon}
                title="All Subjects Bunk"
                description="Calculate classes you can safely bunk across all subjects"
              />
            </StyledButton>
          </div>
        </div>

        <div className="mb-10 flex items-center gap-2">
          <StyledButton
            onClick={handleCalculate}
            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-shadow duration-300 hover:shadow-lg hover:scale-105 hover:bg-green-700 text-base flex items-center gap-1"
          >
            <span role="img" aria-label="dart">🎯</span>
            <span>{currentMode.includes('bunk') ? 'Calculate Bunk' : 'Calculate Attend'}</span>
          </StyledButton>

          <StyledButton
            onClick={handleClear}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition-colors duration-300 text-sm flex items-center gap-1"
          >
            <span role="img" aria-label="broom">🧹</span>
            <span>Clear</span>
          </StyledButton>
        </div>

        <div className="mb-8">
          <InputForm key={inputFormKey} subjectsToRender={subjectsToRender} onEdit={handleDataEdit} />
          
          {staleMessage && (
              <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-center text-yellow-200 font-semibold animate-pulse">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {staleMessage}
              </div>
          )}

          {resultsData && <Results resultsData={resultsData} />}
          
          {resultsData && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4 text-gradient">✨ AI Result Insights</h3>
              
              <div className="bg-black/20 p-6 rounded-lg min-h-[100px] ai-recommendation-content whitespace-pre-wrap">
                {insight || "Click the button for AI advice."}
              </div>

              <StyledButton
                onClick={handleGetInsight}
                disabled={isInsightLoading}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                {isInsightLoading ? 'Generating...' : 'Get AI Insights'}
              </StyledButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CalculatorPanel;