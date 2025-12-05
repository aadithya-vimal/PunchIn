import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const SubjectList = () => {
  const {
    subjects,
    attendanceData,
    selectedSubjects,
    handleSelectSubject,
    setActiveModal,
  } = useContext(UserContext);

  const [sortMode, setSortMode] = useState('name'); 
  const [sortedSubjectsData, setSortedSubjectsData] = useState([]);

  useEffect(() => {
    const combined = subjects.map((subject, index) => {
      const data = attendanceData[index] || {};
      const percentage = data.total > 0 ? (data.attended / data.total) * 100 : -1;
      return { subject, index, percentage };
    });

    let sorted = [...combined];
    if (sortMode === 'name') {
      sorted.sort((a, b) => a.subject.localeCompare(b.subject));
    } else if (sortMode === 'desc') {
      sorted.sort((a, b) => b.percentage - a.percentage);
    } else if (sortMode === 'asc') {
      sorted.sort((a, b) => a.percentage - b.percentage);
    }
    setSortedSubjectsData(sorted);
  }, [subjects, attendanceData, sortMode]);

  const openEditModal = () => setActiveModal('editSubjects');

  return (
    <div className="lg:w-1/4 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg relative z-0">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Your Subjects</h2>
        <button
          title="Edit Subjects"
          onClick={openEditModal} 
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full transition-transform hover:scale-110"
        >
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs text-white/60">
        <span>Sort:</span>
        <button onClick={() => setSortMode('name')} className={`sort-button ${sortMode === 'name' ? 'active' : ''}`}>A-Z</button>
        <button onClick={() => setSortMode('desc')} className={`sort-button ${sortMode === 'desc' ? 'active' : ''}`}>% ↓</button>
        <button onClick={() => setSortMode('asc')} className={`sort-button ${sortMode === 'asc' ? 'active' : ''}`}>% ↑</button>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {sortedSubjectsData.length > 0 ? (
          sortedSubjectsData.map(({ subject, index, percentage }) => {
            const isSelected = selectedSubjects.includes(index);
            return (
              <div
                key={index}
                onClick={() => handleSelectSubject(index)}
                className={`subject-selector p-3 rounded-lg cursor-pointer flex items-center justify-between group ${isSelected ? 'selected' : ''}`}
              >
                <div className="flex items-center flex-grow overflow-hidden">
                  <div className="w-10 h-8 rounded-md bg-white/20 flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                    {percentage > -1 ? `${Math.floor(percentage)}%` : '-'}
                  </div>
                  <div className="truncate text-sm">{subject}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-white/60">
            <i className="fas fa-book-open text-3xl mb-3"></i>
            <p>No subjects added yet!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectList;