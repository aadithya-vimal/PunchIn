import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const TimetableGlance = () => {
  const { subjects, timetable, setActiveModal } = useContext(UserContext);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  // Check if there are any entries in the timetable
  const hasClasses = Object.values(timetable).some(daySchedule => Object.keys(daySchedule).length > 0);

  return (
    <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-3xl font-bold mb-4 md:mb-0">This Week's Schedule</h2>
        <button
          onClick={() => setActiveModal('timetable')}
          title="Set Timetable"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-transform hover:scale-105 flex items-center gap-2"
        >
          <i className="fas fa-clock"></i> Set Timetable
        </button>
      </div>
      
      {subjects.length === 0 ? (
        <div className="text-center text-white/70 bg-black/20 p-6 rounded-xl">
            <p>Please add subjects before setting a timetable.</p>
        </div>
      ) : !hasClasses ? (
        <div className="text-center text-white/70 bg-black/20 p-6 rounded-xl">
          <p>Your weekly timetable is empty.</p>
          <button onClick={() => setActiveModal('timetable')} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">
            Set Timetable Now
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/10">
                <th className="p-3">Period</th>
                {days.map(day => <th key={day} className="p-3">{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period} className="border-b border-white/10">
                  <td className="p-3 font-semibold">Period {period}</td>
                  {days.map(day => {
                    const dayKey = day.toLowerCase();
                    const subjectIndex = timetable[dayKey]?.[period];
                    const subjectName = subjectIndex != null && subjects[subjectIndex] ? subjects[subjectIndex] : '-';
                    return <td key={day} className="p-3 text-sm">{subjectName}</td>;
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