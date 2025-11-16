import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';
// PortalModal is no longer needed here
// import PortalModal from './PortalModal.jsx'; 

const SubjectList = () => {
  const {
    subjects,
    attendanceData,
    selectedSubjects,
    handleSelectSubject,
    // We now need 'setActiveModal' instead of 'saveData'
    setActiveModal, 
  } = useContext(UserContext);

  const [sortMode, setSortMode] = useState('name'); // 'name', 'desc', 'asc'
  const [sortedSubjectsData, setSortedSubjectsData] = useState([]);

  // These states are no longer needed, they live in the correct modal
  // const [isEditOpen, setIsEditOpen] = useState(false);
  // const [editedSubjects, setEditedSubjects] = useState([]);

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

  // This function is now simplified to open the correct modal
  const openEditModal = () => {
    setActiveModal('editSubjects');
  };

  // All these local modal functions are no longer needed
  /*
  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const handleChangeSubject = (index, newName) => {
    setEditedSubjects(prev => {
      const copy = [...prev];
      copy[index] = newName;
      return copy;
    });
  };

  const handleAddSubject = () => {
    setEditedSubjects(prev => [...prev, '']);
  };

  const handleRemoveSubject = (index) => {
    setEditedSubjects(prev => prev.filter((_, i) => i !== index));
  };

  // This was the BUGGY save function that caused the "Only Monday" problem
  const handleConfirmSubjects = async () => {
    const cleaned = editedSubjects.map(s => s.trim()).filter(s => s !== '');
    try {
      await saveData({ subjects: cleaned }); // <--- This was the bug
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to save subjects", error);
      alert("Failed to save subjects, please try again.");
    }
  };
  */

  return (
    <div className="lg:w-1/4 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg relative z-0">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Your Subjects</h2>
        <button
          title="Edit Subjects"
          onClick={openEditModal} // <--- This now opens the correct modal
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full transition-transform hover:scale-110"
          aria-label="Edit Subjects"
        >
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs text-white/60">
        <span>Sort:</span>
        <button onClick={() => setSortMode('name')} className={`sort-button ${sortMode === 'name' ? 'active' : ''}`}>
          A-Z
        </button>
        <button onClick={() => setSortMode('desc')} className={`sort-button ${sortMode === 'desc' ? 'active' : ''}`}>
          % ↓
        </button>
        <button onClick={() => setSortMode('asc')} className={`sort-button ${sortMode === 'asc' ? 'active' : ''}`}>
          % ↑
        </button>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {sortedSubjectsData.length > 0 ? (
          sortedSubjectsData.map(({ subject, index, percentage }) => {
            const isSelected = selectedSubjects.includes(index);
            return (
              <div
                key={index}
                onClick={() => handleSelectSubject(index)}
                className={`subject-selector p-3 rounded-lg cursor-pointer ${isSelected ? 'selected' : ''}`}
              >
                <div className="flex items-center">
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

      {/* The entire buggy modal that was here has been REMOVED */}
      
    </div>
  );
};

export default SubjectList;