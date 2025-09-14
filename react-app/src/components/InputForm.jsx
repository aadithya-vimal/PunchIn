import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const InputForm = ({ subjectsToRender }) => {
  const { subjects, attendanceData, updateAttendanceData } = useContext(UserContext);

  if (subjectsToRender.length === 0) {
    if (subjects.length > 0) {
      return (
        <div className="bg-white/10 p-4 rounded-lg text-center">
          <i className="fas fa-hand-pointer text-2xl mb-2"></i>
          <p>Please select one or more subjects from the left panel.</p>
        </div>
      );
    }
    return (
      <div className="bg-white/10 p-4 rounded-lg text-center">
        <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
        <p>Please add subjects before making a calculation.</p>
      </div>
    );
  }

  const handleInputChange = (index, field, value) => {
    // Only allow digits, empty string allowed for clearing input
    if (/^\d*$/.test(value)) {
      // Convert to number if not empty, else set to empty string
      const newValue = value === '' ? '' : Number(value);
      updateAttendanceData(index, field, newValue);
    }
  };

  return (
    <div className="space-y-6">
      {subjectsToRender.map(index => {
        const data = attendanceData[index] || { attended: '', total: '', requiredPerc: 75 };
        return (
          <div key={index} className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold mb-4">{subjects[index]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm">Classes Attended</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={data.attended === 0 ? '' : data.attended}
                  onChange={e => handleInputChange(index, 'attended', e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2"
                  placeholder="e.g. 15"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">Total Classes Held</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={data.total === 0 ? '' : data.total}
                  onChange={e => handleInputChange(index, 'total', e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2"
                  placeholder="e.g. 20"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">Required %</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={data.requiredPerc === 0 ? '' : data.requiredPerc}
                  onChange={e => handleInputChange(index, 'requiredPerc', e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2"
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
