import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const LastPunchWidget = () => {
  const { lastPunch } = useContext(UserContext);

  if (!lastPunch) return null;

  const isAttended = lastPunch.status === 'attended';

  return (
    <div className="apple-card p-4 flex items-center justify-between border-white/5 bg-white/[0.02]">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
          isAttended 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          <i className={`fas ${isAttended ? 'fa-check' : 'fa-xmark'}`}></i>
        </div>
        <div className="min-w-0">
          <div className="text-xs text-white/50 flex items-center gap-1.5">
            <span>Last Activity Recorded</span>
            <span className="font-mono text-[10px] text-white/30">&bull; {lastPunch.time}</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-white truncate">
            {lastPunch.subjectName} <span className="text-white/40 font-mono text-xs">(P-{lastPunch.period})</span>
          </div>
        </div>
      </div>

      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
        isAttended 
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
          : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
      }`}>
        {lastPunch.status}
      </span>
    </div>
  );
};

export default LastPunchWidget;
