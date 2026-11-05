import React, { useContext, useState } from 'react';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import PodCopyFeature from './PodCopyFeature';

const PodManager = () => {
  const { 
    pods, createPod, joinPod, activePod, setActivePod, leavePod, 
    podMembers, podData, getMemberData 
  } = useContext(PodContext);
  const { currentUser } = useContext(UserContext);
  
  // Local State
  const [addUid, setAddUid] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [newPodName, setNewPodName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Copy Feature State
  const [copyUid, setCopyUid] = useState(null);
  const [copyData, setCopyData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Admin Logic
  const isAdmin = activePod && currentUser?.uid === podData?.members?.[0];

  // --- Actions ---
  const handleCreate = async () => {
    if (!newPodName.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      await createPod(newPodName.trim());
      setStatus('Pod created successfully!');
      setNewPodName('');
    } catch (e) {
      setStatus('Error creating pod: ' + (e.message || e));
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      await joinPod(joinId.trim());
      setStatus('Joined pod successfully!');
      setJoinId('');
    } catch (e) {
      setStatus('Error joining pod: ' + (e.message || e));
    }
    setLoading(false);
  };

  const handleCopyPodId = (podId) => {
    navigator.clipboard.writeText(podId);
    setStatus('Copied Pod ID to clipboard!');
    setTimeout(() => setStatus(''), 2500);
  };

  const handleAddMember = async () => {
    if (!addUid.trim() || !activePod) return;
    setAdminStatus('');
    try {
      const podDocRef = doc(db, 'pods', activePod);
      await updateDoc(podDocRef, { members: arrayUnion(addUid.trim()) });
      setAdminStatus('Member added!');
      setAddUid('');
    } catch (e) {
      setAdminStatus('Error: ' + (e.message || e));
    }
  };

  const handleRemoveMember = async (uid) => {
    if (!activePod || !uid) return;
    setAdminStatus('');
    try {
      const podDocRef = doc(db, 'pods', activePod);
      if (!podData || !podData.members) throw new Error("Pod data not loaded.");
      const updatedMembers = podData.members.filter(id => id !== uid);
      await updateDoc(podDocRef, { members: updatedMembers });
      setAdminStatus('Member removed!');
    } catch (e) {
      setAdminStatus('Error: ' + (e.message || e));
    }
  };

  const handleCopyDataAction = async (uid) => {
    setLoading(true);
    try {
      const data = await getMemberData(uid);
      setCopyUid(uid);
      setCopyData(data);
      setModalOpen(true);
    } catch (e) {
      setStatus('Error fetching member timetable: ' + (e.message || e));
    }
    setLoading(false);
  };

  return (
    <div className="apple-card p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <i className="fas fa-users-viewfinder text-sky-400"></i>
            Study Pods
          </h2>
          <p className="text-xs text-white/50">Collaborate with classmates, sync timetables, and coordinate bunk days.</p>
        </div>
        <span className="apple-badge self-start sm:self-auto">
          {pods.length} Active {pods.length === 1 ? 'Pod' : 'Pods'}
        </span>
      </div>
      
      {status && (
        <div className="mb-5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-200 flex items-center gap-2">
          <i className="fas fa-info-circle text-sky-400"></i>
          <span>{status}</span>
        </div>
      )}

      {/* --- Create & Join Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Create Pod */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Create New Pod</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPodName}
              onChange={e => setNewPodName(e.target.value)}
              placeholder="e.g. CSE Section A"
              className="flex-grow px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleCreate}
              className="apple-btn-primary text-xs px-4 py-2 shrink-0 disabled:opacity-50"
              disabled={loading || !newPodName.trim()}
            >
              Create
            </button>
          </div>
        </div>

        {/* Join Pod */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Join with Pod Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              placeholder="Paste Pod ID code..."
              className="flex-grow px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-sky-500 transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleJoin}
              className="apple-btn-secondary text-xs px-4 py-2 shrink-0 disabled:opacity-50 text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
              disabled={loading || !joinId.trim()}
            >
              Join Pod
            </button>
          </div>
        </div>
      </div>

      {/* --- Pod List Selector --- */}
      <div className="border-t border-white/10 pt-5">
        <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-white/60">Your Joined Pods</h3>
        {pods.length === 0 ? (
          <div className="text-center py-6 text-white/40 border border-dashed border-white/10 rounded-2xl">
            <i className="fas fa-user-plus text-xl mb-1.5 opacity-50"></i>
            <p className="text-xs">No active pods. Create one above or enter a friend's code.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {pods.map(pod => {
              const isActive = activePod === pod.id;
              return (
                <div 
                  key={pod.id} 
                  onClick={() => setActivePod(pod.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isActive 
                      ? 'bg-sky-500/10 border-sky-400/40 shadow-sm' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-sky-400' : 'bg-white/20'}`}></span>
                      {pod.name}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono truncate">ID: {pod.id}</div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleCopyPodId(pod.id)}
                      title="Copy Shareable Pod ID"
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors text-xs"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    {isActive && (
                      <button
                        onClick={leavePod}
                        title="Leave this Pod"
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 flex items-center justify-center transition-colors text-xs"
                      >
                        <i className="fas fa-sign-out-alt"></i>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Active Pod Details --- */}
      {activePod && (
        <div className="mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Pod Members</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 font-mono">{podMembers.length}</span>
            </div>
            {isAdmin && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold tracking-wider self-start sm:self-auto">
                Admin Privileges
              </span>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            {podMembers.map(m => (
              <div key={m.uid} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                    {m.displayName ? m.displayName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className="font-medium text-xs sm:text-sm text-white/90 truncate">{m.displayName}</span>
                  {podData?.members?.[0] === m.uid && (
                    <span className="px-1.5 py-0.5 bg-amber-400 text-black rounded text-[9px] font-bold shrink-0">OWNER</span>
                  )}
                  {m.uid === currentUser?.uid && (
                    <span className="text-white/40 text-[10px] shrink-0">(You)</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                   {/* COPY DATA BUTTON */}
                   {m.uid !== currentUser?.uid && (
                      <button
                        onClick={() => handleCopyDataAction(m.uid)}
                        className="apple-btn-secondary text-[11px] py-1 px-3 text-sky-300 border-sky-500/30 hover:bg-sky-500/10 flex items-center gap-1.5"
                        title="Copy this student's subjects and timetable"
                      >
                         <i className="fas fa-file-import text-[10px]"></i>
                         <span>Copy Timetable</span>
                      </button>
                   )}

                   {/* ADMIN REMOVE BUTTON */}
                   {isAdmin && m.uid !== podData?.members?.[0] && (
                    <button
                      onClick={() => handleRemoveMember(m.uid)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded text-xs transition-colors"
                    >
                      Remove
                    </button>
                   )}
                </div>
              </div>
            ))}
          </div>

          {/* Admin Add Member */}
          {isAdmin && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <label className="text-[11px] font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">Quick Invite / Add Member by UID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addUid}
                  onChange={e => setAddUid(e.target.value)}
                  placeholder="Paste student UID here..."
                  className="flex-grow px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleAddMember}
                  className="apple-btn-primary text-xs px-3.5 py-1.5 shrink-0"
                >
                  Add
                </button>
              </div>
              {adminStatus && <div className="mt-2 text-xs text-amber-300">{adminStatus}</div>}
            </div>
          )}
        </div>
      )}

      {/* Copy Feature Modal */}
      <PodCopyFeature 
        selectedUid={copyUid} 
        memberData={copyData} 
        modalOpen={modalOpen} 
        setModalOpen={setModalOpen} 
      />
    </div>
  );
};

export default PodManager;
