import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const EditSubjectsModal = () => {
  const { subjects, saveSubjects, closeModal } = useContext(UserContext);
  const [localSubjects, setLocalSubjects] = useState(subjects.map(name => ({ id: Math.random(), name })));

  const handleNameChange = (id, newName) => {
    setLocalSubjects(current => current.map(sub => sub.id === id ? { ...sub, name: newName } : sub));
  };

  const handleRemove = (id) => {
    setLocalSubjects(current => current.filter(sub => sub.id !== id));
  };

  const handleAddNew = () => {
    const newSubjectName = document.getElementById('newSubjectInput').value.trim();
    if (newSubjectName) {
      setLocalSubjects(current => [...current, { id: Math.random(), name: newSubjectName }]);
      document.getElementById('newSubjectInput').value = '';
    }
  };

  const handleSave = () => {
    const finalSubjectNames = localSubjects.map(sub => sub.name.trim()).filter(Boolean);
    saveSubjects(finalSubjectNames);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold">Edit Subjects</h2>
          <button onClick={closeModal} className="text-white/60 hover:text-white"><i className="fas fa-times text-xl"></i></button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 space-y-2 mb-6">
          {localSubjects.map(subject => (
            <div key={subject.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input 
                type="text" 
                value={subject.name}
                onChange={(e) => handleNameChange(subject.id, e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1"
              />
              <button onClick={() => handleRemove(subject.id)} className="text-red-400 hover:text-red-300"><i className="fas fa-trash"></i></button>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-4 flex-shrink-0">
          <h3 className="font-semibold mb-3">Add New Subject</h3>
          <div className="flex gap-2">
            <input type="text" id="newSubjectInput" placeholder="Enter subject name" className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2" />
            <button onClick={handleAddNew} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">Add</button>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
          <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditSubjectsModal;