import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const TimetableModal = () => {
  const { subjects, timetable, saveTimetable, closeModal } = useContext(UserContext);
  const [localTimetable, setLocalTimetable] = useState(timetable || {});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  const handleChange = (dayKey, period, subjectIndex) => {
    setLocalTimetable(prev => {
      const newTimetable = { ...prev };
      if (!newTimetable[dayKey]) {
        newTimetable[dayKey] = {};
      }
      if (subjectIndex === "-1") {
        delete newTimetable[dayKey][period];
      } else {
        newTimetable[dayKey][period] = parseInt(subjectIndex, 10);
      }
      return newTimetable;
    });
  };

  const handleSave = async () => {
    try {
      await saveTimetable(localTimetable); // Await save
      closeModal(); // Close modal after save completes
    } catch (error) {
      console.error("Failed to save timetable:", error);
      // optionally show error UI
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold">Set Weekly Timetable</h2>
          <button onClick={closeModal} className="text-white/60 hover:text-white">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-7 gap-4 text-center items-center font-bold sticky top-0 bg-gray-900 py-2">
            <div>Period</div>
            {days.map(d => <div key={d}>{d}</div>)}
          </div>
          {periods.map(period => (
            <div key={period} className="grid grid-cols-7 gap-4 items-center border-t border-white/10 py-2">
              <div className="font-semibold">Period {period}</div>
              {days.map(day => {
                const dayKey = day.toLowerCase();
                const selectedSubject = localTimetable[dayKey]?.[period] ?? "-1";
                return (
                  <div key={day}>
                    <select
                      value={selectedSubject}
                      onChange={(e) => handleChange(dayKey, period, e.target.value)}
                      className="w-full bg-white/10 text-center rounded-md p-1 select-dark text-xs"
                    >
                      <option value="-1">--</option>
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
        <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
          <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Save Timetable
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimetableModal;
