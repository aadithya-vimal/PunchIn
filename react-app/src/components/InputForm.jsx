import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const InputForm = ({ subjectsToRender, onEdit }) => {
  const { subjects, attendanceData, updateAttendanceData } = useContext(UserContext);

  if (subjectsToRender.length === 0) {
    if (subjects.length > 0) {
      return (
        <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <i className="fas fa-hand-pointer text-xl mb-2 opacity-60"></i>
          <p className="text-xs">Select one or more courses from the left panel to calculate attend/bunk projections.</p>
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
        <i className="fas fa-exclamation-circle text-xl mb-2 opacity-60"></i>
        <p className="text-xs">Add subjects before initiating calculations.</p>
      </div>
    );
  }

  const handleInputChange = (index, field, value) => {
    if (/^\d*$/.test(value)) {
      const newValue = value === '' ? '' : Number(value);
      updateAttendanceData(index, field, newValue);
      if (onEdit) onEdit();
    }
  };

  return (
    <div className="space-y-4">
      {subjectsToRender.map(index => {
        const data = attendanceData[index] || { attended: '', total: '', requiredPerc: 75 };
        return (
          <div key={index} className="apple-card p-5 border-white/10 bg-white/[0.02]">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span className="truncate">{subjects[index]}</span>
              <span className="text-[10px] font-mono text-white/40">ID #{index + 1}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1.5 text-xs text-white/60 font-semibold uppercase tracking-wider">
                  Classes Attended
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={data.attended === 0 ? '' : data.attended}
                  onChange={e => handleInputChange(index, 'attended', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-white/60 font-semibold uppercase tracking-wider">
                  Total Held
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={data.total === 0 ? '' : data.total}
                  onChange={e => handleInputChange(index, 'total', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="e.g. 20"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs text-white/60 font-semibold uppercase tracking-wider">
                  Required Criteria (%)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={data.requiredPerc === 0 ? '' : data.requiredPerc}
                  onChange={e => handleInputChange(index, 'requiredPerc', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="e.g. 75"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InputForm;
