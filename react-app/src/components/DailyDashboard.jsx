import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const DailyDashboard = () => {
  const { subjects, timetable, attendanceData, punchIn, undoPunchIn } = useContext(UserContext);
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
  return (
    <div className="mb-10 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-4">Today's Schedule ({dayName})</h2>
      <div className="space-y-3">
        {Object.entries(periods).sort(([p1], [p2]) => p1 - p2).map(([period, subjectIndex]) => {
          const subjectName = subjects[subjectIndex];
          if (!subjectName) return null;
          const data = attendanceData[subjectIndex] || {};
          const status = data.dailyStatus?.[todayDate]?.[period];
          return (
            <div key={period} className="bg-black/20 p-3 rounded-lg flex justify-between items-center text-sm">
              <div><span className="font-bold mr-2">Period {period}:</span><span>{subjectName}</span></div>
              <div className="flex items-center gap-2">
                {status ? (
                  <>
                    <span className={status === 'attended' ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    <button onClick={() => undoPunchIn(subjectIndex, period)} className="ml-2 bg-gray-700/50 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors" title="Undo">↩️</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => punchIn(subjectIndex, period, 'attended')} className="bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-full w-8 h-8 flex items-center justify-center" title="Attended">✅</button>
                    <button onClick={() => punchIn(subjectIndex, period, 'bunked')} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-full w-8 h-8 flex items-center justify-center" title="Bunked">❌</button>
                  </>
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