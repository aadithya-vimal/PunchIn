import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const ProfileModal = () => {
  const { profile, currentUser, saveData, closeModal, getProfileStats, setSubjects, setTimetable } = useContext(UserContext);
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const stats = getProfileStats();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [deleteFinalConfirm, setDeleteFinalConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState('');

  const handleSave = () => {
    saveData({ profile: { ...profile, displayName } });
    closeModal();
  };

  const handleDeleteData = async () => {
    setDeleteStatus('');
    try {
      await saveData({ subjects: [], timetable: {} });
      setSubjects([]);
      setTimetable({});
      setDeleteStatus('Timetable and subject list deleted.');
      setDeleteFinalConfirm(false);
      setDeleteConfirm(false);
      setDeleteCountdown(10);
    } catch (e) {
      setDeleteStatus('Error deleting data.');
    }
  };

  React.useEffect(() => {
    let timer;
    if (deleteConfirm && deleteCountdown > 0) {
      timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000);
    }
    if (deleteCountdown === 0) {
      setDeleteFinalConfirm(true);
    }
    return () => clearTimeout(timer);
  }, [deleteConfirm, deleteCountdown]);

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
        <div className="flex flex-col gap-3 mt-8">
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Cancel</button>
            <button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">Save Changes</button>
          </div>
          <div className="mt-6">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full"
              onClick={() => setDeleteConfirm(true)}
              disabled={deleteConfirm || deleteFinalConfirm}
            >Delete Timetable & Subject List</button>
            {deleteConfirm && !deleteFinalConfirm && (
              <div className="mt-3 text-yellow-300 text-center">Are you sure? This will permanently delete your timetable and subject list. Confirm again in {deleteCountdown} seconds...</div>
            )}
            {deleteFinalConfirm && (
              <div className="mt-3 flex flex-col items-center">
                <div className="text-yellow-400 mb-2">Final confirmation: This action cannot be undone.</div>
                <button
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg"
                  onClick={handleDeleteData}
                >Yes, Delete My Data</button>
                <button
                  className="mt-2 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10"
                  onClick={() => { setDeleteConfirm(false); setDeleteFinalConfirm(false); setDeleteCountdown(10); }}
                >Cancel</button>
              </div>
            )}
            {deleteStatus && <div className="mt-3 text-green-400 text-center">{deleteStatus}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileModal;