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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Class Timings</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-2">
          {periods.map(p => (
            <div key={p} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
              <span className="font-semibold text-indigo-300">Period {p} Starts:</span>
              <input
                type="time"
                value={localTimings[p] || ""}
                onChange={(e) => handleChange(p, e.target.value)}
                className="bg-black/40 border border-white/20 rounded px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-sm">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-sm">Save Timings</button>
        </div>
      </div>
    </div>
  );
};

export default TimingsModal;