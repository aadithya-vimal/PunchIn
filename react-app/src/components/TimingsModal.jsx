import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const TimingsModal = ({ onClose }) => {
  const { classTimings, saveData } = useContext(UserContext);
  const [localTimings, setLocalTimings] = useState({ ...classTimings });

  const periods = Array.from({ length: 8 }, (_, i) => String(i + 1));

  const handleChange = (period, time) => {
    setLocalTimings(prev => ({ ...prev, [period]: time }));
  };

  const handleSave = () => {
    saveData({ classTimings: localTimings });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/98 border border-white/15 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-sm">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Period Bell Timings</h2>
              <p className="text-xs text-white/50">Synchronize Auto-Punch with your college schedule</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-xs"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Periods grid */}
        <div className="space-y-2 mb-6 max-h-[55vh] overflow-y-auto pr-1">
          {periods.map(p => (
            <div key={p} className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-white/50">Period {p}</span>
                <span className="text-[10px] text-white/30">Starts at:</span>
              </div>
              <input
                type="time"
                value={localTimings[p] || ""}
                onChange={(e) => handleChange(p, e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
          <button 
            onClick={onClose} 
            className="apple-btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="apple-btn-primary text-xs px-5 py-2 font-semibold"
          >
            Save Timings
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimingsModal;
