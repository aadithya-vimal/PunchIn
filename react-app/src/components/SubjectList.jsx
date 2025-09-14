import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import PortalModal from './PortalModal.jsx'; // Your portal modal wrapper

const SubjectList = () => {
  const {
    subjects,
    attendanceData,
    selectedSubjects,
    handleSelectSubject,
    saveData,
  } = useContext(UserContext);

  const [sortMode, setSortMode] = useState('name'); // 'name', 'desc', 'asc'
  const [sortedSubjectsData, setSortedSubjectsData] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedSubjects, setEditedSubjects] = useState([]);

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

  const openEditModal = () => {
    setEditedSubjects([...subjects]);
    setIsEditOpen(true);
  };

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

  // Add empty new subject input
  const handleAddSubject = () => {
    setEditedSubjects(prev => [...prev, '']);
  };

  const handleRemoveSubject = (index) => {
    setEditedSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmSubjects = async () => {
    const cleaned = editedSubjects.map(s => s.trim()).filter(s => s !== '');
    try {
      await saveData({ subjects: cleaned });
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to save subjects", error);
      alert("Failed to save subjects, please try again.");
    }
  };

  return (
    <div className="lg:w-1/4 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg relative z-0">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Your Subjects</h2>
        <button
          title="Edit Subjects"
          onClick={openEditModal}
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

      {/* Modal via React Portal */}
      {isEditOpen && (
        <PortalModal>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-subjects-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="bg-gray-900 text-white rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col shadow-lg">
              <h3 id="edit-subjects-title" className="text-xl mb-4 font-bold text-center">
                Edit Subjects
              </h3>
              <div className="flex flex-col gap-3 flex-grow overflow-y-auto mb-4">
                {editedSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => handleChangeSubject(index, e.target.value)}
                      className="flex-grow p-2 rounded bg-gray-800 border border-gray-700 text-white"
                      placeholder={`Subject #${index + 1}`}
                      autoFocus={index === editedSubjects.length - 1}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(index)}
                      title="Remove subject"
                      className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 flex-shrink-0"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2"
                >
                  + Add Subject
                </button>
                <div>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="mr-3 px-4 py-2 rounded border border-white/20 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubjects}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    Confirm Subjects
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PortalModal>
      )}
    </div>
  );
};

export default SubjectList;
