import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AttendanceCalculatorPage = () => {
  // Minimal initial inputs
  const [attended, setAttended] = useState(26);
  const [total, setTotal] = useState(32);
  const [required, setRequired] = useState(75);
  
  // Depth / Advanced Simulation parameters
  const [upcomingClasses, setUpcomingClasses] = useState(15);
  const [projectedAttendanceRate, setProjectedAttendanceRate] = useState(80);
  const [medicalCondonation, setMedicalCondonation] = useState(0);

  // Core calculations
  const numAttended = Math.max(0, Number(attended) || 0);
  const numTotal = Math.max(0, Number(total) || 0);
  const numReq = Math.min(100, Math.max(1, Number(required) || 75));
  
  const currentPercentage = numTotal > 0 ? (numAttended / numTotal) * 100 : 0;
  
  // Classes needed to reach required target
  const calculateClassesNeeded = () => {
    if (numTotal === 0) return 0;
    if (currentPercentage >= numReq) return 0;
    const reqDec = numReq / 100;
    const numerator = reqDec * numTotal - numAttended;
    const denominator = 1 - reqDec;
    if (denominator <= 0) return Infinity;
    return Math.max(0, Math.ceil(numerator / denominator));
  };

  // Safe bunks calculation
  const calculateSafeBunks = () => {
    if (numTotal === 0 || currentPercentage < numReq) return 0;
    const reqDec = numReq / 100;
    return Math.max(0, Math.floor((numAttended - reqDec * numTotal) / reqDec));
  };

  const classesNeeded = calculateClassesNeeded();
  const safeBunks = calculateSafeBunks();

  // Depth Analytics: Semester Projection
  const numUpcoming = Math.max(0, Number(upcomingClasses) || 0);
  const numProjectedAttended = Math.round((Number(projectedAttendanceRate) / 100) * numUpcoming);
  const projectedTotal = numTotal + numUpcoming;
  const projectedAttended = numAttended + numProjectedAttended;
  const projectedPercentage = projectedTotal > 0 ? (projectedAttended / projectedTotal) * 100 : 0;
  
  // With medical condonation
  const effectivePercentageWithCondonation = Math.min(
    100,
    projectedPercentage + Number(medicalCondonation)
  );

  return (
    <div className="gradient-bg min-h-screen text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07090e]/75 border-b border-white/[0.06] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/AttendanceApplication.ico" 
            alt="Punch.In Logo" 
            className="w-7 h-7 object-contain drop-shadow" 
          />
          <span className="text-base font-bold tracking-tight text-white">Punch<span className="text-sky-400">.In</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/bunk-engine" className="text-xs text-white/70 hover:text-white transition-colors hidden sm:inline">
            Bunk Engine &rarr;
          </Link>
          <Link to="/login" className="apple-btn-primary text-xs px-4 py-2">
            Launch Full App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-grow w-full">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="apple-badge mb-3">
            <i className="fas fa-calculator text-sky-400"></i> Free Online Academic Utility
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gradient mb-3">
            College Attendance Calculator
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Compute your exact attendance percentage, minimum classes needed for eligibility, and safe bunks instantly with zero setup.
          </p>
        </div>

        {/* Minimal Input Bar */}
        <div className="apple-card p-6 sm:p-8 mb-8 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                Classes Attended
              </label>
              <input
                type="number"
                min="0"
                value={attended}
                onChange={e => setAttended(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="26"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                Total Classes Held
              </label>
              <input
                type="number"
                min="1"
                value={total}
                onChange={e => setTotal(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="32"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                Required Criteria (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={required}
                onChange={e => setRequired(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="75"
              />
            </div>
          </div>
        </div>

        {/* Instant Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Current Percentage */}
          <div className="apple-card p-6 text-center border border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1">Current Attendance</span>
            <div className={`text-4xl font-extrabold font-mono tracking-tight ${
              currentPercentage >= numReq ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {currentPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-white/40 mt-1 font-mono">{numAttended} of {numTotal} attended</p>
          </div>

          {/* Safe Bunks */}
          <div className="apple-card p-6 text-center border border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1">Safe Bunks Remaining</span>
            <div className="text-4xl font-extrabold font-mono tracking-tight text-sky-400">
              {safeBunks}
            </div>
            <p className="text-xs text-white/40 mt-1">
              {safeBunks > 0 ? `Can skip ${safeBunks} more without penalty` : `Below ${numReq}% limit`}
            </p>
          </div>

          {/* Classes Needed */}
          <div className="apple-card p-6 text-center border border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1">Recovery Classes Needed</span>
            <div className="text-4xl font-extrabold font-mono tracking-tight text-amber-400">
              {classesNeeded}
            </div>
            <p className="text-xs text-white/40 mt-1">
              {classesNeeded === 0 ? `Requirement satisfied` : `Attend consecutively to hit ${numReq}%`}
            </p>
          </div>
        </div>

        {/* Surprising Depth Section: Advanced Forecast & Condonation Model */}
        <div className="apple-card p-6 sm:p-8 border border-white/10 mb-12">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10 mb-6">
            <i className="fas fa-chart-line text-sky-400 text-sm"></i>
            <h2 className="text-base font-bold text-white tracking-tight">
              In-Depth Semester Forecast & Medical Condonation Simulation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold uppercase text-white/60 mb-1.5">
                  <span>Upcoming Classes In Semester</span>
                  <span className="font-mono text-white font-bold">{upcomingClasses} periods</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={upcomingClasses}
                  onChange={e => setUpcomingClasses(e.target.value)}
                  className="w-full accent-sky-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold uppercase text-white/60 mb-1.5">
                  <span>Your Projected Attendance Rate</span>
                  <span className="font-mono text-sky-400 font-bold">{projectedAttendanceRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={projectedAttendanceRate}
                  onChange={e => setProjectedAttendanceRate(e.target.value)}
                  className="w-full accent-sky-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold uppercase text-white/60 mb-1.5">
                  <span>Medical Condonation / Exemption Allowance</span>
                  <span className="font-mono text-emerald-400 font-bold">+{medicalCondonation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={medicalCondonation}
                  onChange={e => setMedicalCondonation(e.target.value)}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Projected Outcome Panel */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                End-of-Semester Projected Output
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Final Estimated Classes:</span>
                <span className="font-mono font-bold text-white">{projectedAttended} / {projectedTotal}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">Estimated Normal %:</span>
                <span className="font-mono font-bold text-white">{projectedPercentage.toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/60">With Condonation Added:</span>
                <span className="font-mono font-bold text-emerald-400">{effectivePercentageWithCondonation.toFixed(1)}%</span>
              </div>

              <div className="pt-2">
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  effectivePercentageWithCondonation >= numReq 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <i className={`fas ${effectivePercentageWithCondonation >= numReq ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                  <span>
                    {effectivePercentageWithCondonation >= numReq 
                      ? `Projected Exam Eligibility Confirmed (${effectivePercentageWithCondonation.toFixed(1)}% >= ${numReq}%)`
                      : `Deficit Warning: Need to raise attendance rate to hit ${numReq}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Explanations & Formula Reference */}
        <section className="apple-card p-6 sm:p-8 border border-white/10 prose-apple mb-8 text-xs sm:text-sm">
          <h2 className="text-lg font-bold text-white mb-2">How College Attendance Calculations Work</h2>
          <p>
            Most universities enforce a strict <strong>75% or 85% attendance criteria</strong> to permit students to sit for semester examinations. Calculating whether you can afford to miss a lecture or how many subsequent lectures you must attend consecutively depends on the mathematical limits of fractional ratios:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
              <span className="text-sky-400 font-bold block mb-1">Consecutive Classes to Recover ($C$):</span>
              <code>C = ceil((Req * Total - Attended) / (1 - Req))</code>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
              <span className="text-emerald-400 font-bold block mb-1">Safe Bunk Allowance ($B$):</span>
              <code>B = floor((Attended - Req * Total) / Req)</code>
            </div>
          </div>

          <p>
            When you use <strong>Punch.In</strong>, this math runs continuously in the background for every individual subject, automated timetable periods, and collective class Pods.
          </p>

          <div className="mt-6 not-prose">
            <Link to="/login" className="apple-btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2">
              <span>Automate With Full Punch.In Companion</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#07090e] py-6 px-6 text-xs text-white/40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/70">Punch.In Attendance Tools</span>
            <span>&copy; {new Date().getFullYear()} Aadithya Vimal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/bunk-engine" className="hover:text-white transition-colors">Bunk Engine</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AttendanceCalculatorPage;
