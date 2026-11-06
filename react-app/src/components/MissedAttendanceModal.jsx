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
    if (!startDate || !endDate) return;
    checkForMissedAttendance(startDate, endDate);
  };

  const groupedSessions = missedAttendance.sessions.reduce((acc, session) => {
    if (!acc[session.displayDate]) acc[session.displayDate] = [];
    acc[session.displayDate].push(session);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/98 border border-white/15 rounded-3xl w-full max-w-4xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="apple-badge text-[10px]">
                <i className="fas fa-calendar-check text-sky-400"></i> Attendance Backlog
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Catch Up Attendance</h2>
            <p className="text-xs text-white/50">
              Identified <strong className="text-white">{missedAttendance.daysMissed} days</strong> with unrecorded lectures in schedule range.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white/[0.03] border border-white/10 p-2.5 rounded-2xl text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/40 uppercase font-semibold">From</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/40 uppercase font-semibold">To</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <button 
              onClick={handleRecheck}
              className="apple-btn-secondary text-xs px-3 py-1 text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
            >
              Scan
            </button>
          </div>
        </div>

        {/* Content list of missed sessions */}
        <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-5">
          {missedAttendance.sessions.length === 0 ? (
            <div className="text-center py-12 text-white/50 border border-dashed border-white/10 rounded-2xl">
              <i className="fas fa-circle-check text-2xl text-emerald-400 mb-2"></i>
              <p className="text-sm font-semibold text-white">All Caught Up!</p>
              <p className="text-xs text-white/40 mt-1">No missed attendance records found for this date range.</p>
            </div>
          ) : (
            Object.entries(groupedSessions).map(([displayDate, sessions]) => (
              <div key={displayDate} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <span className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                    <i className="fas fa-calendar-day text-sky-400 text-xs"></i>
                    {displayDate}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">{sessions.length} periods</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {sessions.map(session => {
                    const key = `${session.date}-${session.period}-${session.subjectIndex}`;
                    const status = sessionStatuses[key] || 'attended';
                    const isAttended = status === 'attended';

                    return (
                      <div
                        key={key}
                        onClick={() => toggleStatus(session)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 select-none ${
                          isAttended 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-rose-500/10 border-rose-500/30'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-mono text-[10px] text-white/40 block">P{session.period}</span>
                          <span className="text-xs font-semibold text-white truncate block">
                            {session.subjectName}
                          </span>
                        </div>

                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                          isAttended 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {isAttended ? 'Present' : 'Bunked'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-between gap-3 flex-shrink-0 text-xs">
          <span className="text-[11px] text-white/40 hidden sm:inline">
            Tap any period card to toggle between Present and Bunked.
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <button 
              onClick={closeModal}
              className="apple-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={missedAttendance.sessions.length === 0}
              className="apple-btn-primary text-xs px-5 py-2 font-semibold disabled:opacity-40"
            >
              Apply All Punches ({missedAttendance.sessions.length})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MissedAttendanceModal;
