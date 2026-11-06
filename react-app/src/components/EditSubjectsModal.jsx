import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const EditSubjectsModal = () => {
  const { subjects, saveSubjects, closeModal } = useContext(UserContext);
  const [localSubjects, setLocalSubjects] = useState(
    subjects.map((name) => ({ id: Date.now() + Math.random(), name }))
  );
  const [newSubjectName, setNewSubjectName] = useState('');

  const handleNameChange = (id, newName) => {
    setLocalSubjects(current => current.map(sub => sub.id === id ? { ...sub, name: newName } : sub));
  };

  const handleRemove = (id) => {
    setLocalSubjects(current => current.filter(sub => sub.id !== id));
  };

  const handleAddNew = (e) => {
    e?.preventDefault();
    const trimmedName = newSubjectName.trim();
    if (trimmedName) {
      setLocalSubjects(current => [...current, { id: Date.now() + Math.random(), name: trimmedName }]);
      setNewSubjectName('');
    }
  };

  const handleSave = () => {
    const finalSubjectNames = localSubjects.map(sub => sub.name.trim()).filter(Boolean);
    saveSubjects(finalSubjectNames);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/98 border border-white/15 rounded-3xl p-6 sm:p-7 w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-sm">
              <i className="fas fa-book-bookmark"></i>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Course Catalog & Subjects</h2>
              <p className="text-xs text-white/50">{localSubjects.length} subjects registered</p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-xs"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Scrollable list of subjects */}
        <div className="flex-grow overflow-y-auto pr-1 space-y-2 mb-4">
          {localSubjects.length === 0 ? (
            <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-2xl">
              <i className="fas fa-layer-group text-xl mb-1.5 opacity-50"></i>
              <p className="text-xs">No subjects in your catalog. Add courses below.</p>
            </div>
          ) : (
            localSubjects.map((subject, idx) => (
              <div 
                key={subject.id} 
                className="flex items-center gap-2 p-2.5 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-white/10 transition-colors"
              >
                <span className="font-mono text-xs font-semibold text-white/40 px-2 shrink-0">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) => handleNameChange(subject.id, e.target.value)}
                  className="flex-1 bg-transparent border-0 text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 px-1"
                  placeholder="Subject title..."
                />
                <button 
                  onClick={() => handleRemove(subject.id)} 
                  className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 flex items-center justify-center transition-colors text-xs shrink-0"
                  title="Remove Subject"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add New Subject */}
        <form onSubmit={handleAddNew} className="pt-3 border-t border-white/10 flex-shrink-0">
          <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
            Add New Course
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Distributed Operating Systems"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!newSubjectName.trim()}
              className="apple-btn-secondary text-xs px-4 py-2 shrink-0 disabled:opacity-40"
            >
              + Add
            </button>
          </div>
        </form>

        {/* Modal Controls */}
        <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-white/10 flex-shrink-0">
          <button 
            onClick={closeModal} 
            className="apple-btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="apple-btn-primary text-xs px-5 py-2 font-semibold"
          >
            Save Subject Catalog
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditSubjectsModal;
