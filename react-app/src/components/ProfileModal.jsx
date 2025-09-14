import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const ProfileModal = () => {
  const { profile, currentUser, saveData, closeModal, getProfileStats } = useContext(UserContext);
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const stats = getProfileStats();

  const handleSave = () => {
    saveData({ profile: { ...profile, displayName } });
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-lg flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Profile & Settings</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70">Display Name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 block w-full bg-white/10 border rounded-md px-3 py-2 text-white" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70">Email</label>
          <p className="mt-1 text-white/90">{currentUser.email}</p>
        </div>
        <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 border-b border-white/10 pb-2">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gradient">{stats.totalSubjects}</p>
                    <p className="text-sm text-white/70">Total Subjects</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gradient">{stats.overallAttendance}%</p>
                    <p className="text-sm text-white/70">Overall Attendance</p>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
export default ProfileModal;