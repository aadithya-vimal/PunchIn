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
      <div className="mb-10 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Today's Schedule ({dayName})</h2>
        <p className="text-center text-white/70 italic">No classes scheduled for today.</p>
      </div>
    );
  }

  const handleSwap = (period, newSubjectIndex) => {
      markSubstitution(todayDate, period, newSubjectIndex);
      setSwappingPeriod(null);
  };

  return (
    <div className="mb-10 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-4">Today's Schedule ({dayName})</h2>
      <div className="space-y-3">
        {Object.entries(periods).sort(([p1], [p2]) => p1 - p2).map(([period, defaultSubjectIndex]) => {
          
          // 1. DETERMINE ACTIVE SUBJECT
          // Check if there is an override for this specific date and period
          const overrideIndex = dailyOverrides?.[todayDate]?.[period];
          
          // Use override if exists, otherwise use default from timetable
          const currentSubjectIndex = overrideIndex !== undefined ? overrideIndex : defaultSubjectIndex;
          
          const subjectName = subjects[currentSubjectIndex];
          const isSubstituted = overrideIndex !== undefined;

          if (!subjectName) return null;
          
          // 2. FETCH STATUS FOR ACTIVE SUBJECT
          // We check the status of 'currentSubjectIndex' (e.g., Physics), ignoring 'defaultSubjectIndex' (Math)
          const data = attendanceData[currentSubjectIndex] || {};
          const status = data.dailyStatus?.[todayDate]?.[period];

          return (
            <div key={period} className={`p-3 rounded-lg flex flex-col gap-2 ${isSubstituted ? 'bg-indigo-900/40 border border-indigo-500/30' : 'bg-black/20'}`}>
              <div className="flex justify-between items-center text-sm">
                
                {/* LEFT: Period & Subject Name */}
                <div className="flex items-center gap-2 flex-grow min-w-0">
                    <span className="font-bold whitespace-nowrap">P-{period}:</span>
                    
                    {swappingPeriod === period ? (
                        <select 
                            className="bg-black text-white text-xs p-1 rounded border border-white/20 max-w-[150px]"
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
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className={`truncate ${isSubstituted ? 'text-indigo-300 font-semibold' : ''}`}>
                                {subjectName}
                            </span>
                            {isSubstituted && <span className="text-[10px] bg-indigo-600 px-1 rounded text-white" title="Substituted Class">Sub</span>}
                        </div>
                    )}

                    {/* SWAP BUTTON: Only allowed if no attendance marked yet */}
                    {!status && swappingPeriod !== period && (
                        <button 
                            onClick={() => setSwappingPeriod(period)}
                            className="text-white/30 hover:text-white transition-colors ml-1"
                            title="Substitute Subject"
                        >
                            <i className="fas fa-exchange-alt text-xs"></i>
                        </button>
                    )}
                </div>

                {/* RIGHT: Punch Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {status ? (
                    <>
                      <span className={status === 'attended' ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <button onClick={() => undoPunchIn(currentSubjectIndex, period)} className="ml-2 bg-gray-700/50 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors" title="Undo">↩️</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => punchIn(currentSubjectIndex, period, 'attended')} className="bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-full w-8 h-8 flex items-center justify-center" title="Attended">✅</button>
                      <button onClick={() => punchIn(currentSubjectIndex, period, 'bunked')} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-full w-8 h-8 flex items-center justify-center" title="Bunked">❌</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DailyDashboard;