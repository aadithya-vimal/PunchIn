import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext.jsx';
import useSEO from '../hooks/useSEO';

const BunkEnginePage = () => {
  const userContext = useContext(UserContext) || {};
  const { subjects = [], attendanceData = {} } = userContext;

  // Deep SEO configuration for university bunk and class skipping keywords
  useSEO({
    title: "The Bunk Engine — Safe Class Bunk Calculator & Attendance Forecaster",
    description: "Calculate exactly how many classes you can skip without falling below university criteria. Boundary condition simulation, safe bunks left, and recovery predictions.",
    keywords: "bunk engine, how many classes can i bunk, safe bunks calculator, college bunking formula, 75 percent bunk calculator, attendance recovery calculator, university attendance simulation, skip class calculator",
    canonicalUrl: "https://punchin.pages.dev/bunk-engine",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Punch.In Bunk Engine",
      "applicationCategory": "EducationalApplication",
      "url": "https://punchin.pages.dev/bunk-engine",
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0" },
      "featureList": [
        "Safe Bunks Allowance Engine",
        "Consecutive Recovery Classes Prediction",
        "Hypothetical Bunk Matrix (1-5 Future Lectures)",
        "Collaborative Group Pod Bunk Coordination"
      ]
    }
  });

  // Active Subject selection or Standalone playground
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(
    subjects.length > 0 ? 0 : -1
  );

  // Playground state for standalone / manual simulation
  const [manualSubjectName, setManualSubjectName] = useState("Software Engineering");
  const [attended, setAttended] = useState(24);
  const [total, setTotal] = useState(28);
  const [criteria, setCriteria] = useState(75);

  // If user has subjects in context, sync with selected
  const activeSubjectName = selectedSubjectIndex >= 0 && subjects[selectedSubjectIndex] 
    ? subjects[selectedSubjectIndex] 
    : manualSubjectName;

  const activeAttended = selectedSubjectIndex >= 0 && attendanceData[selectedSubjectIndex]
    ? Number(attendanceData[selectedSubjectIndex].attended) || 0
    : Math.max(0, Number(attended) || 0);

  const activeTotal = selectedSubjectIndex >= 0 && attendanceData[selectedSubjectIndex]
    ? Number(attendanceData[selectedSubjectIndex].total) || 0
    : Math.max(0, Number(total) || 0);

  const activeCriteria = selectedSubjectIndex >= 0 && attendanceData[selectedSubjectIndex]
    ? Number(attendanceData[selectedSubjectIndex].requiredPerc) || 75
    : Math.min(100, Math.max(1, Number(criteria) || 75));

  // Current Attendance Ratio
  const currentPercentage = activeTotal > 0 ? (activeAttended / activeTotal) * 100 : 0;
  const isEligible = currentPercentage >= activeCriteria;

  // 1. Safe Bunks Engine: Max consecutive classes you can skip right now before dropping below criteria
  const calculateBunks = () => {
    if (activeTotal === 0 || !isEligible) return 0;
    const reqDec = activeCriteria / 100;
    const bunks = Math.floor((activeAttended - reqDec * activeTotal) / reqDec);
    return Math.max(0, bunks);
  };

  // 2. Recovery Engine: Classes to attend consecutively without bunking to hit criteria
  const calculateRecovery = () => {
    if (activeTotal === 0 || isEligible) return 0;
    const reqDec = activeCriteria / 100;
    const numerator = reqDec * activeTotal - activeAttended;
    const denominator = 1 - reqDec;
    if (denominator <= 0) return Infinity;
    return Math.max(0, Math.ceil(numerator / denominator));
  };

  const safeBunks = calculateBunks();
  const classesNeeded = calculateRecovery();

  // Timeline projection: What happens if you bunk the next 1, 2, 3, 4, 5 classes?
  const bunkScenarios = [1, 2, 3, 4, 5].map(bunkCount => {
    const projectedTotal = activeTotal + bunkCount;
    const projectedPercentage = projectedTotal > 0 ? (activeAttended / projectedTotal) * 100 : 0;
    const status = projectedPercentage >= activeCriteria ? 'safe' : 'danger';
    return {
      bunkCount,
      projectedTotal,
      projectedPercentage,
      status
    };
  });

  return (
    <div className="gradient-bg min-h-screen text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07090e]/75 border-b border-white/[0.06] px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img 
            src="/AttendanceApplication.ico" 
            alt="Punch.In Logo" 
            className="w-7 h-7 object-contain drop-shadow" 
          />
          <span className="text-base font-bold tracking-tight text-white">
            Punch<span className="text-sky-400">.In</span>
            <span className="text-white/40 font-mono text-xs ml-2 font-normal hidden sm:inline">/ Bunk Engine</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/calculator" className="text-xs text-white/70 hover:text-white transition-colors hidden sm:inline">
            Quick Calc
          </Link>
          <Link to="/login" className="apple-btn-primary text-xs px-4 py-2">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-14 flex-grow w-full">
        
        {/* Hero Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="apple-badge mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
            Algorithmic Class Skipping Simulator
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gradient mb-3">
            The Bunk Engine
          </h1>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            Never guess whether you can take a day off. The Bunk Engine performs exact boundary condition analysis on your academic requirements so you can skip safely without risking detention or test debarment.
          </p>
        </div>

        {/* Input Switcher: If user has registered subjects vs Sandbox */}
        <div className="apple-card p-5 sm:p-7 border border-white/10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-5">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-sliders text-sky-400"></i> Course & Attendance Parameters
            </h2>
            {subjects.length > 0 && (
              <span className="apple-badge text-[10px]">
                {subjects.length} Enrolled Courses Linked
              </span>
            )}
          </div>

          {subjects.length > 0 ? (
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block mb-2">
                Choose Registered Course:
              </label>
              <div className="flex flex-wrap gap-2">
                {subjects.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSubjectIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      selectedSubjectIndex === idx 
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400/40' 
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedSubjectIndex(-1)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    selectedSubjectIndex === -1 
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/40' 
                      : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                  }`}
                >
                  Custom Simulator
                </button>
              </div>
            </div>
          ) : null}

          {/* If Sandbox / Custom simulator is active */}
          {selectedSubjectIndex === -1 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={manualSubjectName}
                  onChange={e => setManualSubjectName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Attended
                </label>
                <input
                  type="number"
                  min="0"
                  value={attended}
                  onChange={e => setAttended(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Total Classes
                </label>
                <input
                  type="number"
                  min="1"
                  value={total}
                  onChange={e => setTotal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">
                  Target Required %
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={criteria}
                  onChange={e => setCriteria(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Engine Verdict Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Status Box */}
          <div className="apple-card p-5 sm:p-6 border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">Current Standing</span>
            <div className="my-3">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {currentPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-white/50 mt-1 truncate">
                {activeSubjectName} &bull; {activeAttended}/{activeTotal} attended
              </p>
            </div>
            <div className="pt-2 border-t border-white/5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isEligible 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                <i className={`fas ${isEligible ? 'fa-check' : 'fa-triangle-exclamation'}`}></i>
                <span>{isEligible ? `Above Criteria (${activeCriteria}%)` : `Below Criteria (${activeCriteria}%)`}</span>
              </span>
            </div>
          </div>

          {/* Safe Bunks Box */}
          <div className="apple-card p-5 sm:p-6 border-sky-500/30 bg-sky-950/20 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400">Safe Bunks Allowance</span>
            <div className="my-3">
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-sky-300">
                {safeBunks}
              </div>
              <p className="text-xs text-sky-200/60 mt-1">
                Consecutive periods you can skip immediately
              </p>
            </div>
            <div className="text-xs text-white/60 pt-2 border-t border-white/5">
              {safeBunks > 0 
                ? `Leaves you at ~${((activeAttended / (activeTotal + safeBunks)) * 100).toFixed(1)}% after ${safeBunks} bunks`
                : `0 safe bunks available. Any skip will push you further into deficit.`}
            </div>
          </div>

          {/* Recovery Needed */}
          <div className="apple-card p-5 sm:p-6 border-amber-500/30 bg-amber-950/20 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Classes Needed</span>
            <div className="my-3">
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-amber-300">
                {classesNeeded}
              </div>
              <p className="text-xs text-amber-200/60 mt-1">
                Consecutive attendances to restore {activeCriteria}%
              </p>
            </div>
            <div className="text-xs text-white/60 pt-2 border-t border-white/5">
              {classesNeeded === 0 
                ? "Attendance requirement currently fulfilled." 
                : `Attending next ${classesNeeded} brings you to exactly ${activeCriteria}%.`}
            </div>
          </div>
        </div>

        {/* Bunk Scenarios Simulation Matrix */}
        <div className="apple-card p-5 sm:p-8 border border-white/10 mb-10 overflow-hidden">
          <div className="pb-4 border-b border-white/10 mb-5">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i className="fas fa-network-wired text-sky-400"></i>
              Hypothetical Bunk Impact Projection Matrix
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Simulates exactly what your percentage becomes if you skip consecutive upcoming lectures.
            </p>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-left text-xs min-w-[420px]">
              <thead>
                <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Classes Bunked</th>
                  <th className="py-2.5 px-3">New Ratio</th>
                  <th className="py-2.5 px-3">Projected %</th>
                  <th className="py-2.5 px-3">Eligibility State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {bunkScenarios.map(s => (
                  <tr key={s.bunkCount} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-white">
                      +{s.bunkCount} {s.bunkCount === 1 ? 'Class' : 'Classes'} Skipped
                    </td>
                    <td className="py-3 px-3 text-white/60">
                      {activeAttended} / {s.projectedTotal}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span className={s.status === 'safe' ? 'text-emerald-400' : 'text-rose-400'}>
                        {s.projectedPercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {s.status === 'safe' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Safe &ge; {activeCriteria}%
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          Penalty &lt; {activeCriteria}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engine Mechanics Explanation */}
        <div className="apple-card p-5 sm:p-8 border border-white/10 prose-apple text-xs sm:text-sm">
          <h3 className="text-base font-bold text-white mb-2">How the Bunk Engine Derives These Numbers</h3>
          <p>
            When you skip a class, your total classes held increments ($Total + 1$), but your attended classes ($Attended$) remains static. Because attendance is a bounded ratio $Attended / Total$, the rate of percentage decline accelerates the fewer total classes you have held.
          </p>
          <p>
            The Bunk Engine inverts this inequality:
          </p>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs my-3 text-sky-300 not-prose">
            Max Bunks (B) = floor((Attended - (Required% / 100) * Total) / (Required% / 100))
          </div>
          <p>
            In collaborative <strong>Study Pods</strong>, the Bunk Engine combines the individual matrices of every student in your group to calculate an optimal group day off where no single student drops below the mandatory threshold.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#07090e] py-6 px-4 sm:px-8 text-xs text-white/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/AttendanceApplication.ico" alt="Punch.In Logo" className="w-4 h-4 object-contain" />
            <span className="font-semibold text-white/70">Punch.In Engine Suite</span>
            <span>&copy; {new Date().getFullYear()} Aadithya Vimal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/calculator" className="hover:text-white transition-colors">Calculator</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BunkEnginePage;
