import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const ProfileModal = () => {
  const { 
    profile, 
    currentUser, 
    saveData, 
    closeModal, 
    getProfileStats, 
    setSubjects, 
    setTimetable, 
    setAttendanceData,
    deleteAllUserData 
  } = useContext(UserContext);
  
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const stats = getProfileStats();
  
  // Timetable + Subjects deletion state
  const [deleteSubjectsConfirm, setDeleteSubjectsConfirm] = useState(false);
  const [deleteSubjectsCountdown, setDeleteSubjectsCountdown] = useState(5);
  
  // All Data Nuclear deletion state
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [deleteAllCountdown, setDeleteAllCountdown] = useState(5);
  const [deleteStatus, setDeleteStatus] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = () => {
    saveData({ profile: { ...profile, displayName } });
    closeModal();
  };

  // 1. Partial Delete (Timetable & Subjects)
  const handleDeleteTimetableOnly = async () => {
    setIsDeleting(true);
    setDeleteStatus('');
    try {
      await saveData({ subjects: [], timetable: {} });
      setSubjects([]);
      setTimetable({});
      setDeleteStatus('Timetable and subject list cleared.');
      setDeleteSubjectsConfirm(false);
      setDeleteSubjectsCountdown(5);
    } catch (e) {
      setDeleteStatus('Error clearing timetable: ' + (e.message || e));
    } finally {
      setIsDeleting(false);
    }
  };

  // 2. Full Delete (Delete ALL user data completely)
  const handleDeleteEverything = async () => {
    setIsDeleting(true);
    setDeleteStatus('');
    try {
      await deleteAllUserData();
      setDeleteStatus('All account data, attendance records, timings, and schedules have been permanently deleted.');
      setDeleteAllConfirm(false);
      setDeleteAllCountdown(5);
    } catch (e) {
      setDeleteStatus('Error deleting account data: ' + (e.message || e));
    } finally {
      setIsDeleting(false);
    }
  };

  // Countdown timer for partial delete
  useEffect(() => {
    let timer;
    if (deleteSubjectsConfirm && deleteSubjectsCountdown > 0) {
      timer = setTimeout(() => setDeleteSubjectsCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [deleteSubjectsConfirm, deleteSubjectsCountdown]);

  // Countdown timer for nuclear delete
  useEffect(() => {
    let timer;
    if (deleteAllConfirm && deleteAllCountdown > 0) {
      timer = setTimeout(() => setDeleteAllCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [deleteAllConfirm, deleteAllCountdown]);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/95 border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl flex flex-col max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <i className="fas fa-user-circle text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Account & Settings</h2>
              <p className="text-xs text-white/50">Manage your profile, sync stats, and data storage</p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Profile Info */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="e.g. Alex Rivera"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">Connected Email</label>
            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm flex items-center justify-between">
              <span className="font-mono text-xs sm:text-sm">{currentUser?.email}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Verified</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">Your Academic Summary</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <p className="text-2xl font-bold text-white tracking-tight">{stats.totalSubjects}</p>
              <p className="text-xs text-white/50 mt-0.5">Enrolled Subjects</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <p className="text-2xl font-bold text-white tracking-tight">{stats.overallAttendance}%</p>
              <p className="text-xs text-white/50 mt-0.5">Aggregate Attendance</p>
            </div>
          </div>
        </div>

        {/* Status notification */}
        {deleteStatus && (
          <div className="mb-6 p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-2">
            <i className="fas fa-info-circle text-sky-400"></i>
            <span>{deleteStatus}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pb-6 border-b border-white/10">
          <button 
            onClick={closeModal} 
            className="apple-btn-secondary text-xs sm:text-sm px-4 py-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="apple-btn-primary text-xs sm:text-sm px-5 py-2"
          >
            Save Changes
          </button>
        </div>

        {/* Danger Zone: Data Management */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">
            <i className="fas fa-shield-alt"></i> Danger Zone
          </div>
          
          <div className="space-y-3">
            {/* Action 1: Delete Timetable & Subjects only */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Reset Timetable & Subjects</h4>
                  <p className="text-xs text-white/50">Clears current course subjects and scheduled period slots while preserving past records.</p>
                </div>
                {!deleteSubjectsConfirm && (
                  <button
                    onClick={() => { setDeleteSubjectsConfirm(true); setDeleteSubjectsCountdown(5); }}
                    disabled={isDeleting}
                    className="apple-btn-secondary text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10 whitespace-nowrap px-3 py-1.5 shrink-0"
                  >
                    Reset Timetable
                  </button>
                )}
              </div>

              {deleteSubjectsConfirm && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-amber-200">
                    Confirm reset in {deleteSubjectsCountdown > 0 ? `${deleteSubjectsCountdown}s` : 'now'}?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteSubjectsConfirm(false)}
                      className="px-3 py-1 rounded-lg bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteTimetableOnly}
                      disabled={deleteSubjectsCountdown > 0 || isDeleting}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium disabled:opacity-50"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action 2: Purge ALL Data (Subject, timetable, attendance, notes, overrides, logs) */}
            <div className="p-4 rounded-2xl bg-red-500/[0.04] border border-red-500/20 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-red-200">Delete ALL Account Data</h4>
                  <p className="text-xs text-white/50">Permanently wipes everything: attendance history, all subjects, timetable, daily punches, timings, notes, and overrides.</p>
                </div>
                {!deleteAllConfirm && (
                  <button
                    onClick={() => { setDeleteAllConfirm(true); setDeleteAllCountdown(5); }}
                    disabled={isDeleting}
                    className="apple-btn-danger text-xs whitespace-nowrap px-3 py-1.5 shrink-0"
                  >
                    Purge All Data
                  </button>
                )}
              </div>

              {deleteAllConfirm && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-red-300 font-medium">
                    ⚠️ Irreversible: Delete entire account record {deleteAllCountdown > 0 ? `(${deleteAllCountdown}s)...` : ''}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteAllConfirm(false)}
                      className="px-3 py-1 rounded-lg bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      Abort
                    </button>
                    <button
                      onClick={handleDeleteEverything}
                      disabled={deleteAllCountdown > 0 || isDeleting}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-950/50 disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;
