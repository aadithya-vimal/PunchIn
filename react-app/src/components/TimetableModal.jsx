import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const TimetableModal = () => {
  const { subjects, timetable, saveData, closeModal } = useContext(UserContext);
  const [localTimetable, setLocalTimetable] = useState(timetable || {});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  const handleChange = (dayKey, period, subjectIndex) => {
    setLocalTimetable(prev => {
      const newTimetable = { ...prev };
      if (!newTimetable[dayKey]) {
        newTimetable[dayKey] = {};
      }
      // "-1" represents explicitly Free / No Period or cleared period
      if (subjectIndex === "-1") {
        newTimetable[dayKey][period] = -1;
      } else {
        newTimetable[dayKey][period] = parseInt(subjectIndex, 10);
      }
      return newTimetable;
    });
  };

  const handleSave = async () => {
    try {
      await saveData({ timetable: localTimetable }); 
      closeModal(); 
    } catch (error) {
      console.error("Failed to save timetable:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/98 border border-white/10 rounded-3xl p-5 sm:p-7 w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-sm">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Set Weekly Timetable</h2>
              <p className="text-[11px] text-white/50">Map subjects or mark free / leisure periods across all 8 period slots</p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-xs"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Scrollable Matrix Table - Mobile Optimized */}
        <div className="flex-grow overflow-auto pr-1">
          <div className="min-w-[640px]">
            {/* Header row */}
            <div className="grid grid-cols-7 gap-2 text-center items-center font-bold sticky top-0 bg-[#0f131c] py-2.5 z-10 border-b border-white/10 text-xs text-white/70">
              <div className="text-white/40 font-mono text-[11px]">Period</div>
              {days.map(d => (
                <div key={d} className="uppercase tracking-wider text-[11px] font-semibold text-white/90">
                  {d.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Periods */}
            {periods.map(period => (
              <div key={period} className="grid grid-cols-7 gap-2 items-center border-b border-white/5 py-2">
                <div className="font-mono text-xs font-semibold text-white/60 text-center">
                  P{period}
                </div>
                {days.map(day => {
                  const dayKey = day.toLowerCase();
                  const selectedSubject = localTimetable[dayKey]?.[period] ?? "-1";
                  const isFree = selectedSubject === -1 || selectedSubject === "-1";

                  return (
                    <div key={day} className="px-0.5">
                      <select
                        value={selectedSubject}
                        onChange={(e) => handleChange(dayKey, period, e.target.value)}
                        className={`w-full text-center rounded-xl p-2 select-dark text-[11px] border font-medium transition-colors ${
                          isFree 
                            ? 'bg-white/[0.02] text-white/40 border-white/5' 
                            : 'bg-sky-500/10 text-sky-200 border-sky-500/25'
                        }`}
                      >
                        <option value="-1">🏖️ Free / No Period</option>
                        {subjects.map((subject, index) => (
                          <option key={index} value={index}>{subject}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-4 border-t border-white/10 flex-shrink-0 text-xs">
          <div className="text-white/40 text-[11px] flex items-center gap-1.5">
            <i className="fas fa-circle-info text-sky-400"></i>
            <span>Marking a slot as Free excludes it from auto-punch and bunk calculations.</span>
          </div>

          <div className="flex gap-2.5 self-end sm:self-auto">
            <button 
              onClick={closeModal} 
              className="apple-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="apple-btn-primary text-xs px-5 py-2 font-semibold"
            >
              Save Timetable
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TimetableModal;
