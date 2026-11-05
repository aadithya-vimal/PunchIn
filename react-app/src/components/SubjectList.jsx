import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import EditPercentageModal from './EditPercentageModal.jsx';

const SubjectList = () => {
  const {
    subjects,
    attendanceData,
    selectedSubjects,
    handleSelectSubject,
    setActiveModal,
    setSubjectPercentage,
  } = useContext(UserContext);

  const [sortMode, setSortMode] = useState('name'); 
  const [sortedSubjectsData, setSortedSubjectsData] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    const combined = subjects.map((subject, index) => {
      const data = attendanceData[index] || {};
      const attended = Number(data.attended) || 0;
      const total = Number(data.total) || 0;
      const percentage = total > 0 ? (attended / total) * 100 : -1;
      return { subject, index, percentage, attended, total };
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

  const handleSavePercentage = async (targetPct, totalClasses) => {
    if (editingSubject !== null) {
      await setSubjectPercentage(editingSubject.index, targetPct, totalClasses);
      setEditingSubject(null);
    }
  };

  return (
    <div className="lg:w-1/4 apple-card p-5 relative z-0 flex flex-col">
      {/* Title & Edit Subjects Trigger */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Subjects</h2>
          <p className="text-xs text-white/50">{subjects.length} course{subjects.length === 1 ? '' : 's'} tracked</p>
        </div>
        <button
          title="Manage Subject Catalog"
          onClick={openEditModal} 
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all text-xs"
        >
          <i className="fas fa-sliders-h"></i>
        </button>
      </div>

      {/* Sorting Tabs */}
      <div className="flex items-center gap-1.5 mb-4 p-1 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-white/60">
        <span className="text-[10px] uppercase font-semibold tracking-wider px-2 text-white/40">Sort</span>
        <button 
          onClick={() => setSortMode('name')} 
          className={`flex-1 py-1 rounded-lg text-center transition-all ${sortMode === 'name' ? 'bg-white/15 text-white font-medium shadow-sm' : 'hover:text-white'}`}
        >
          A-Z
        </button>
        <button 
          onClick={() => setSortMode('desc')} 
          className={`flex-1 py-1 rounded-lg text-center transition-all ${sortMode === 'desc' ? 'bg-white/15 text-white font-medium shadow-sm' : 'hover:text-white'}`}
        >
          % ↓
        </button>
        <button 
          onClick={() => setSortMode('asc')} 
          className={`flex-1 py-1 rounded-lg text-center transition-all ${sortMode === 'asc' ? 'bg-white/15 text-white font-medium shadow-sm' : 'hover:text-white'}`}
        >
          % ↑
        </button>
      </div>

      {/* Subjects List */}
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {sortedSubjectsData.length > 0 ? (
          sortedSubjectsData.map(({ subject, index, percentage, attended, total }) => {
            const isSelected = selectedSubjects.includes(index);
            const statusColor = percentage < 0 
              ? 'text-white/40 bg-white/5 border-white/10' 
              : percentage >= 85 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : percentage >= 75 
                  ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' 
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

            return (
              <div
                key={index}
                className={`subject-selector p-2.5 rounded-2xl cursor-pointer flex items-center justify-between group relative overflow-hidden transition-all ${
                  isSelected ? 'selected' : 'bg-white/[0.03]'
                }`}
                onClick={() => handleSelectSubject(index)}
              >
                {/* Left info */}
                <div className="flex items-center min-w-0 mr-2">
                  <div className={`w-11 h-9 rounded-xl border flex items-center justify-center mr-2.5 flex-shrink-0 font-mono text-xs font-semibold ${statusColor}`}>
                    {percentage > -1 ? `${Math.floor(percentage)}%` : '—'}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs sm:text-sm font-medium text-white/90 group-hover:text-white">
                      {subject}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {attended}/{total} classes
                    </div>
                  </div>
                </div>

                {/* Direct Edit Percentage Trigger */}
                <button
                  type="button"
                  title="Directly edit attendance percentage"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSubject({ subject, index, percentage, attended, total });
                  }}
                  className="opacity-40 group-hover:opacity-100 hover:bg-white/10 w-7 h-7 rounded-lg text-white/70 hover:text-white flex items-center justify-center transition-all text-xs shrink-0"
                >
                  <i className="fas fa-pen text-[10px]"></i>
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-white/40 border border-dashed border-white/10 rounded-2xl p-6">
            <i className="fas fa-book-open text-2xl mb-2 opacity-50"></i>
            <p className="text-xs">No subjects added yet.</p>
            <button
              onClick={openEditModal}
              className="mt-3 text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              + Add first course
            </button>
          </div>
        )}
      </div>

      {/* Edit Percentage Modal */}
      {editingSubject && (
        <EditPercentageModal
          subjectName={editingSubject.subject}
          currentPercentage={editingSubject.percentage}
          currentAttended={editingSubject.attended}
          currentTotal={editingSubject.total}
          onSave={handleSavePercentage}
          onClose={() => setEditingSubject(null)}
        />
      )}
    </div>
  );
};

export default SubjectList;
