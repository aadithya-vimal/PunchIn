import React, { useState } from 'react';

const EditPercentageModal = ({ 
  subjectName, 
  currentPercentage, 
  currentAttended = 0, 
  currentTotal = 0, 
  onSave, 
  onClose 
}) => {
  // Direct Present (Attended) and Total Classes state
  const [attendedClasses, setAttendedClasses] = useState(
    currentAttended > 0 ? String(currentAttended) : (currentPercentage > 0 ? "15" : "0")
  );
  const [totalClasses, setTotalClasses] = useState(
    currentTotal > 0 ? String(currentTotal) : (currentPercentage > 0 ? "20" : "0")
  );
  const [error, setError] = useState('');

  // Live calculated percentage
  const numAttended = Math.max(0, parseInt(attendedClasses, 10) || 0);
  const numTotal = Math.max(0, parseInt(totalClasses, 10) || 0);
  const livePercentage = numTotal > 0 ? (numAttended / numTotal) * 100 : 0;

  const handleApply = (e) => {
    e.preventDefault();
    setError('');

    if (numAttended > numTotal) {
      setError('Attended classes cannot be greater than total classes held.');
      return;
    }

    onSave(numAttended, numTotal);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/98 border border-white/15 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-sm">
              <i className="fas fa-pen-to-square"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Edit Attendance Record</h3>
              <p className="text-xs text-white/50 truncate max-w-[210px] sm:max-w-[240px]">{subjectName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          
          {/* Present / Total Input Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block mb-1.5">
                Present / Attended
              </label>
              <input
                type="number"
                min="0"
                value={attendedClasses}
                onChange={(e) => {
                  setError('');
                  setAttendedClasses(e.target.value);
                }}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-lg font-bold text-center focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="15"
                required
                autoFocus
              />
              <span className="text-[10px] text-white/40 block text-center mt-1">Classes present</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 block mb-1.5">
                Total Classes Held
              </label>
              <input
                type="number"
                min="0"
                value={totalClasses}
                onChange={(e) => {
                  setError('');
                  setTotalClasses(e.target.value);
                }}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-lg font-bold text-center focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="20"
                required
              />
              <span className="text-[10px] text-white/40 block text-center mt-1">Total held</span>
            </div>
          </div>

          {/* Live Ratio & Percentage Preview Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Calculated Ratio</span>
              <div className="text-sm font-mono font-semibold text-white mt-0.5">
                {numAttended} / {numTotal} <span className="text-xs text-white/40">classes</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Effective %</span>
              <div className={`text-2xl font-mono font-bold tracking-tight ${
                numTotal === 0 
                  ? 'text-white/40' 
                  : livePercentage >= 75 
                    ? 'text-emerald-400' 
                    : 'text-rose-400'
              }`}>
                {numTotal > 0 ? `${livePercentage.toFixed(1)}%` : '—'}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <i className="fas fa-triangle-exclamation text-rose-400 shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <p className="text-[11px] text-white/40 leading-relaxed">
            Directly updates your present and total class counts. If set to 0/0, the subject is treated as unrecorded and safely excluded from bunk predictions.
          </p>

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
              Save Record
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditPercentageModal;
