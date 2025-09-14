import React, { useState, useEffect } from 'react';

const DisclaimerModal = ({ open, onConfirm, onCancel }) => {
  const [timer, setTimer] = useState(10);
  useEffect(() => {
    if (!open) return;
    setTimer(10);
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Important Disclaimer</h2>
        <p className="mb-4">Copying another member's subjects and timetable will <strong>overwrite</strong> your current data and <strong>reset your attendance</strong> to zero for all subjects. This change <strong>cannot be undone</strong>.</p>
        <p className="mb-4 text-yellow-400">You must wait {timer} seconds before confirming.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Cancel</button>
          <button onClick={onConfirm} disabled={timer > 0} className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg ${timer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>I Understand, Overwrite</button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
