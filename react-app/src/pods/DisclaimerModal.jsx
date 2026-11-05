import React from 'react';

const DisclaimerModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-xl">
          <i className="fas fa-exclamation-triangle"></i>
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight mb-2">Import Peer Timetable?</h3>
        
        <p className="text-xs text-white/60 leading-relaxed mb-4">
          Copying this classmate's setup will overwrite your existing <strong className="text-white">subjects list and weekly schedule</strong> with theirs. Your attendance counters will start clean at zero for each newly copied course.
        </p>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-white/50 mb-6 space-y-1">
          <div className="flex items-center gap-2 text-white/80">
            <i className="fas fa-check text-sky-400"></i> Course catalog copied instantly
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <i className="fas fa-check text-sky-400"></i> Monday-Friday timetable mapped
          </div>
          <div className="flex items-center gap-2 text-amber-300">
            <i className="fas fa-rotate text-amber-400"></i> Local records initialized safely
          </div>
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="apple-btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="apple-btn-primary text-xs px-5 py-2 text-amber-950 bg-amber-300 hover:bg-amber-200"
          >
            Confirm & Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
