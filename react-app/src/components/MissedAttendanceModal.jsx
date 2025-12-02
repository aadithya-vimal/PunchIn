import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const MissedAttendanceModal = () => {
  const { missedAttendance, batchPunchIn, closeModal, checkForMissedAttendance } = useContext(UserContext);
  const [sessionStatuses, setSessionStatuses] = useState({});
  
  // Date Picker State
  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todayStr);

  useEffect(() => {
    if (missedAttendance) {
      const initial = {};
      missedAttendance.sessions.forEach(session => {
        const key = `${session.date}-${session.period}-${session.subjectIndex}`;
        initial[key] = 'attended';
      });
      setSessionStatuses(initial);
      
      if (!startDate) {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          setStartDate(d.toISOString().slice(0, 10));
      }
    }
  }, [missedAttendance]);

  if (!missedAttendance) return null;

  const toggleStatus = (session) => {
    const key = `${session.date}-${session.period}-${session.subjectIndex}`;
    setSessionStatuses(prev => ({
      ...prev,
      [key]: prev[key] === 'attended' ? 'bunked' : 'attended'
    }));
  };

  const handleConfirm = () => {
    const updates = missedAttendance.sessions.map(session => {
      const key = `${session.date}-${session.period}-${session.subjectIndex}`;
      return {
        ...session,
        status: sessionStatuses[key] || 'attended'
      };
    });
    batchPunchIn(updates);
  };

  const handleRecheck = () => {
      if(!startDate || !endDate) return;
      checkForMissedAttendance(startDate, endDate);
  };

  const groupedSessions = missedAttendance.sessions.reduce((acc, session) => {
    if (!acc[session.displayDate]) acc[session.displayDate] = [];
    acc[session.displayDate].push(session);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-5xl flex flex-col max-h-[90vh] shadow-2xl border border-white/10">
        
        <div className="p-6 border-b border-white/10 bg-indigo-900/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h2 className="text-3xl font-bold text-white mb-1">Catch Up Attendance</h2>
              <p className="text-white/70">
                Found <strong>{missedAttendance.daysMissed} missed days</strong> in selected range.
              </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end gap-2 bg-black/20 p-2 rounded-lg">
             <div className="flex items-center gap-2">
                 <div className="flex flex-col">
                     <span className="text-[10px] text-white/50 uppercase font-bold">From</span>
                     <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"/>
                 </div>
                 <div className="flex flex-col">
                     <span className="text-[10px] text-white/50 uppercase font-bold">To</span>
                     <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"/>
                 </div>
             </div>
             <button onClick={handleRecheck} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-bold h-full">Check</button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {missedAttendance.sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/50">
                  <i className="fas fa-calendar-check text-4xl mb-3"></i>
                  <p>No missed classes found in this range!</p>
                  <p className="text-xs">Adjust dates above to check other periods.</p>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedSessions).map(([dateLabel, sessions]) => (
                <div key={dateLabel} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                    <h3 className="text-sm font-bold text-indigo-300 mb-3 uppercase tracking-wider border-b border-white/5 pb-2">{dateLabel}</h3>
                    <div className="space-y-2">
                    {sessions.map(session => {
                        const key = `${session.date}-${session.period}-${session.subjectIndex}`;
                        const status = sessionStatuses[key];
                        const isAttended = status === 'attended';

                        return (
                        <div 
                            key={key} 
                            onClick={() => toggleStatus(session)}
                            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all border ${
                            isAttended 
                                ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                                : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                            }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                                isAttended ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                            }`}>
                                {isAttended ? <i className="fas fa-check"></i> : <i className="fas fa-times"></i>}
                            </div>
                            <div className="min-w-0">
                                <div className="font-semibold text-white truncate text-sm">{session.subjectName}</div>
                                <div className="text-[10px] text-white/50">Period {session.period}</div>
                            </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center bg-gray-900 rounded-b-2xl gap-4">
          <div className="text-xs text-white/40">
             <i className="fas fa-info-circle mr-1"></i>
             Tap classes to mark as <strong>Absent</strong>. Default is Present.
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={closeModal} 
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm font-medium"
              >
                Cancel
              </button>
              {missedAttendance.sessions.length > 0 && (
                <button 
                    onClick={handleConfirm} 
                    className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                >
                    Confirm Updates
                </button>
              )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MissedAttendanceModal;