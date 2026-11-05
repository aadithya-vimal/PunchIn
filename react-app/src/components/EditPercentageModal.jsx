import React, { useState } from 'react';

const EditPercentageModal = ({ subjectName, currentPercentage, currentAttended, currentTotal, onSave, onClose }) => {
  const [targetPercentage, setTargetPercentage] = useState(
    currentPercentage > -1 ? Math.round(currentPercentage) : 75
  );
  const [totalClasses, setTotalClasses] = useState(currentTotal > 0 ? currentTotal : 20);

  // Computed attended count based on live inputs
  const calculatedAttended = Math.round((Math.max(0, Math.min(100, Number(targetPercentage))) / 100) * (Number(totalClasses) || 20));

  const handleApply = (e) => {
    e.preventDefault();
    const pct = Math.min(100, Math.max(0, Number(targetPercentage)));
    const tot = Math.max(1, Number(totalClasses) || 20);
    onSave(pct, tot);
  };

  const quickPresets = [60, 75, 80, 85, 90, 100];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/95 border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <i className="fas fa-percentage text-sm"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Adjust Attendance %</h3>
              <p className="text-xs text-white/50 truncate max-w-[220px]">{subjectName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-5">
          
          {/* Target Percentage Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Target Attendance (%)</label>
              <span className="font-mono text-sm font-bold text-sky-400">{targetPercentage}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(e.target.value)}
                className="w-full accent-sky-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(Math.min(100, Math.max(0, e.target.value)))}
                className="w-16 bg-white/5 border border-white/15 rounded-xl px-2 py-1.5 text-center text-white font-mono text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {quickPresets.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setTargetPercentage(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    Number(targetPercentage) === preset 
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 font-semibold' 
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Basis Classes Calculation */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/60">Total Semester Classes Held:</span>
              <input
                type="number"
                min="1"
                max="300"
                value={totalClasses}
                onChange={(e) => setTotalClasses(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 bg-white/5 border border-white/15 rounded-xl px-2 py-1 text-center text-white font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
            
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-white/50">Computed Attended:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {calculatedAttended} / {totalClasses} classes
              </span>
            </div>
          </div>

          <div className="text-[11px] text-white/40 leading-relaxed">
            Directly edits your attendance percentage and recalibrates your attended-to-total ratio seamlessly.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="apple-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apple-btn-primary text-xs px-5 py-2"
            >
              Apply Percentage
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditPercentageModal;
