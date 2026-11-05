import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const TimetableGlance = () => {
  const { subjects, timetable, setActiveModal } = useContext(UserContext);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  // Check if there are any valid non-free subject entries
  const hasClasses = Object.values(timetable).some(daySchedule => 
    Object.values(daySchedule).some(subIdx => subIdx !== -1 && subIdx !== "-1" && subjects[subIdx] != null)
  );

  return (
    <div className="mb-8 apple-card p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <i className="fas fa-calendar-week text-sky-400"></i>
            Weekly Timetable Matrix
          </h2>
          <p className="text-xs text-white/50">Comprehensive overview of weekly periods and scheduled free slots</p>
        </div>

        <button
          onClick={() => setActiveModal('timetable')}
          className="apple-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <i className="fas fa-edit text-[10px]"></i>
          <span>Edit Timetable</span>
        </button>
      </div>
      
      {subjects.length === 0 ? (
        <div className="text-center text-white/50 bg-white/[0.02] border border-dashed border-white/10 p-8 rounded-2xl">
          <p className="text-xs">Add course subjects first to set up your weekly class schedule.</p>
        </div>
      ) : !hasClasses ? (
        <div className="text-center text-white/50 bg-white/[0.02] border border-dashed border-white/10 p-8 rounded-2xl">
          <p className="text-xs mb-3">Your weekly schedule currently has no assigned subjects.</p>
          <button 
            onClick={() => setActiveModal('timetable')} 
            className="apple-btn-secondary text-xs px-4 py-2"
          >
            Configure Weekly Periods
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-left border-collapse min-w-[580px] text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Period</th>
                {days.map(day => (
                  <th key={day} className="py-2.5 px-3 font-semibold text-white/80">
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {periods.map(period => (
                <tr key={period} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-white/60">P{period}</td>
                  {days.map(day => {
                    const dayKey = day.toLowerCase();
                    const subjectIndex = timetable[dayKey]?.[period];
                    const isFree = subjectIndex === -1 || subjectIndex === "-1" || subjectIndex == null;
                    const subjectName = !isFree && subjects[subjectIndex] ? subjects[subjectIndex] : null;

                    return (
                      <td key={day} className="py-2.5 px-3">
                        {subjectName ? (
                          <span className="font-medium text-white/90 truncate block max-w-[110px]" title={subjectName}>
                            {subjectName}
                          </span>
                        ) : (
                          <span className="text-white/30 text-[11px] italic font-mono">Free</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimetableGlance;
