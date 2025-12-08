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
    if (!newPodName) return;
    setLoading(true);
    setStatus('');
    try {
      await createPod(newPodName);
      setStatus('Pod created successfully!');
      setNewPodName('');
    } catch (e) {
      setStatus('Error creating pod: ' + (e.message || e));
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!joinId) return;
    setLoading(true);
    setStatus('');
    try {
      await joinPod(joinId);
      setStatus('Joined pod successfully!');
      setJoinId('');
    } catch (e) {
      setStatus('Error joining pod: ' + (e.message || e));
    }
    setLoading(false);
  };

  const handleCopyPodId = (podId) => {
    navigator.clipboard.writeText(podId);
    setStatus('Copied pod ID!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleAddMember = async () => {
    if (!addUid || !activePod) return;
    setAdminStatus('');
    try {
      const podDocRef = doc(db, 'pods', activePod);
      await updateDoc(podDocRef, { members: arrayUnion(addUid) });
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
        setStatus('Error fetching member data');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4">Punch.in Pods</h2>
      
      {status && (
        <div className="mb-4 p-2 bg-indigo-900/50 border border-indigo-500/50 rounded text-sm text-indigo-200">
          {status}
        </div>
      )}

      {/* --- Create & Join Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPodName}
              onChange={e => setNewPodName(e.target.value)}
              placeholder="New Pod Name"
              className="flex-grow px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:border-indigo-500"
              disabled={loading}
            />
            <button
              onClick={handleCreate}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 whitespace-nowrap"
              disabled={loading || !newPodName.trim()}
            >
              Create
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              placeholder="Pod ID to Join"
              className="flex-grow px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:border-indigo-500"
              disabled={loading}
            />
            <button
              onClick={handleJoin}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 whitespace-nowrap"
              disabled={loading || !joinId.trim()}
            >
              Join
            </button>
          </div>
      </div>

      {/* --- Pod List --- */}
      <div className="border-t border-white/10 pt-4">
        <h3 className="font-semibold mb-3 text-lg">Your Pods</h3>
        {pods.length === 0 ? (
          <p className="text-white/50 text-sm">You haven't joined any pods yet.</p>
        ) : (
          <ul className="space-y-2">
            {pods.map(pod => (
              <li key={pod.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <button
                    onClick={() => setActivePod(pod.id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors truncate ${
                      activePod === pod.id 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {pod.name}
                  </button>
                  <span className="text-xs text-white/40 font-mono hidden sm:inline truncate">{pod.id}</span>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyPodId(pod.id)}
                    title="Copy Pod ID"
                    className="text-white/60 hover:text-white px-2 py-1"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  {activePod === pod.id && (
                    <button
                      onClick={leavePod}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded text-xs border border-red-500/30"
                      title="Leave Pod"
                    >
                      Leave
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Active Pod Details --- */}
      {activePod && (
        <div className="mt-6 bg-black/20 p-4 rounded-xl border border-white/5">
          <h4 className="font-bold mb-3 border-b border-white/10 pb-2 flex justify-between items-center">
            <span>Members</span>
            {isAdmin && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded uppercase">Admin View</span>}
          </h4>
          
          <ul className="space-y-2 mb-4">
            {podMembers.map(m => (
              <li key={m.uid} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm bg-white/5 p-2 rounded gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white/90">{m.displayName}</span>
                  {podData?.members?.[0] === m.uid && (
                    <span className="px-1.5 py-0.5 bg-yellow-400 text-black rounded-[4px] text-[10px] font-bold">OWNER</span>
                  )}
                  {m.uid === currentUser?.uid && (
                    <span className="text-white/40 text-xs italic">(You)</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                   {/* COPY DATA BUTTON */}
                   {m.uid !== currentUser?.uid && (
                      <button
                        onClick={() => handleCopyDataAction(m.uid)}
                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                        title="Copy Timetable & Subjects"
                      >
                         <i className="fas fa-download"></i> Copy Data
                      </button>
                   )}

                   {/* ADMIN REMOVE BUTTON */}
                   {isAdmin && m.uid !== podData?.members?.[0] && (
                    <button
                      onClick={() => handleRemoveMember(m.uid)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded text-xs transition-colors"
                    >
                      Remove
                    </button>
                   )}
                </div>
              </li>
            ))}
          </ul>

          {/* Admin Add Member */}
          {isAdmin && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <label className="text-xs text-white/50 mb-1 block">Add Member by UID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addUid}
                  onChange={e => setAddUid(e.target.value)}
                  placeholder="Paste User ID here..."
                  className="flex-grow px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-sm focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={handleAddMember}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  Add
                </button>
              </div>
              {adminStatus && <div className="mt-2 text-xs text-yellow-300">{adminStatus}</div>}
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