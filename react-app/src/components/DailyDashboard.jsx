import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const DailyDashboard = () => {
  const { subjects, timetable, attendanceData, punchIn, undoPunchIn, dailyOverrides, markSubstitution } = useContext(UserContext);
  const [swappingPeriod, setSwappingPeriod] = useState(null);

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dayKey = dayName.toLowerCase();
  const todayDate = today.toISOString().slice(0, 10);
  const periods = timetable[dayKey];

  if (subjects.length === 0 || !periods || Object.keys(periods).length === 0) {
    return (
      <div className="apple-card p-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i className="fas fa-calendar-day text-sky-400"></i>
            Today's Schedule ({dayName})
          </h2>
        </div>
        <p className="text-center text-xs text-white/50 py-4">No scheduled periods for today.</p>
      </div>
    );
  }

  const handleSwap = (period, newSubjectIndex) => {
    markSubstitution(todayDate, period, newSubjectIndex);
    setSwappingPeriod(null);
  };

  return (
    <div className="apple-card p-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <i className="fas fa-calendar-day text-sky-400"></i>
          Today's Schedule ({dayName})
        </h2>
        <span className="text-[10px] font-mono text-white/40">{todayDate}</span>
      </div>

      <div className="space-y-2.5">
        {Object.entries(periods).sort(([p1], [p2]) => p1 - p2).map(([period, defaultSubjectIndex]) => {
          const overrideIndex = dailyOverrides?.[todayDate]?.[period];
          const currentSubjectIndex = overrideIndex !== undefined ? overrideIndex : defaultSubjectIndex;
          const subjectName = subjects[currentSubjectIndex];
          const isSubstituted = overrideIndex !== undefined;

          if (!subjectName) return null;
          
          const data = attendanceData[currentSubjectIndex] || {};
          const status = data.dailyStatus?.[todayDate]?.[period];

          return (
            <div 
              key={period} 
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isSubstituted 
                  ? 'bg-sky-500/[0.07] border-sky-500/30' 
                  : 'bg-white/[0.03] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                <span className="font-mono text-xs font-semibold text-white/50 shrink-0">P{period}</span>
                
                {swappingPeriod === period ? (
                  <select 
                    className="bg-[#0f131c] text-white text-xs p-1.5 rounded-xl border border-white/20 max-w-[160px] focus:outline-none focus:border-sky-500"
                    value={currentSubjectIndex}
                    onChange={(e) => handleSwap(period, e.target.value)}
                    onBlur={() => setSwappingPeriod(null)}
                    autoFocus
                  >
                    {subjects.map((sub, idx) => (
                      <option key={idx} value={idx}>{sub}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs sm:text-sm font-medium text-white truncate">
                      {subjectName}
                    </span>
                    {isSubstituted && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Sub
                      </span>
                    )}
                  </div>
                )}

                {!status && swappingPeriod !== period && (
                  <button 
                    onClick={() => setSwappingPeriod(period)}
                    className="text-white/30 hover:text-white transition-colors ml-1"
                    title="Substitute Course"
                  >
                    <i className="fas fa-arrow-right-arrow-left text-[10px]"></i>
                  </button>
                )}
              </div>

              {/* Punch Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {status ? (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      status === 'attended' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {status === 'attended' ? 'Attended' : 'Bunked'}
                    </span>
                    <button 
                      onClick={() => undoPunchIn(currentSubjectIndex, period)} 
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors text-xs" 
                      title="Undo Status"
                    >
                      <i className="fas fa-rotate-left text-[10px]"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => punchIn(currentSubjectIndex, period, 'attended')}
                      className="px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all"
                    >
                      Attend
                    </button>
                    <button
                      onClick={() => punchIn(currentSubjectIndex, period, 'bunked')}
                      className="px-3 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
                    >
                      Bunk
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyDashboard;
