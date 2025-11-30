import React, { useContext, useState } from 'react';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

const PodManager = () => {
  const { pods, createPod, joinPod, activePod, setActivePod, leavePod, getMemberDisplayName, podMembers, podData } = useContext(PodContext);
  const { currentUser } = useContext(UserContext);
  const [addUid, setAddUid] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const isAdmin = activePod && currentUser?.uid === podData?.members?.[0];

  // Add member to pod (admin only)
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
  // Remove member from pod (admin only)
  const handleRemoveMember = async (uid) => {
    if (!activePod || !uid) return;
    setAdminStatus('');
    try {
      const podDocRef = doc(db, 'pods', activePod);
      const updatedMembers = podData.members.filter(id => id !== uid);
      await updateDoc(podDocRef, { members: updatedMembers });
      setAdminStatus('Member removed!');
    } catch (e) {
      setAdminStatus('Error: ' + (e.message || e));
    }
  };
  const [newPodName, setNewPodName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

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
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4">Punch.in Pods</h2>
      {status && <div className="mb-4 text-yellow-300">{status}</div>}
      <div className="mb-6">
        <input
          type="text"
          value={newPodName}
          onChange={e => setNewPodName(e.target.value)}
          placeholder="New Pod Name"
          // Bug #9 Fix: Add bg-white/10 and text-white
          className="px-3 py-2 rounded-lg border border-white/20 mr-2 bg-white/10 text-white"
          disabled={loading}
        />
        <button
          onClick={handleCreate}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >Create Pod</button>
      </div>
      <div className="mb-6">
        <input
          type="text"
          value={joinId}
          onChange={e => setJoinId(e.target.value)}
          placeholder="Pod ID to Join"
          // Bug #9 Fix: Add bg-white/10 and text-white
          className="px-3 py-2 rounded-lg border border-white/20 mr-2 bg-white/10 text-white"
          disabled={loading}
        />
        <button
          onClick={handleJoin}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >Join Pod</button>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Your Pods:</h3>
        <ul>
          {pods.map(pod => (
            <li key={pod.id} className="mb-2 flex items-center gap-2">
              <button
                onClick={() => setActivePod(pod.id)}
                // Bug #13 Fix: Change text-black to text-white for inactive pods
                className={`px-3 py-1 rounded-lg ${activePod === pod.id ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white'}`}
              >{pod.name} <span className="text-xs text-gray-400">({pod.id})</span></button>
              <button
                onClick={() => handleCopyPodId(pod.id)}
                title="Copy Pod ID"
                className="bg-gray-700 hover:bg-gray-900 text-white px-2 py-1 rounded text-xs"
              >Copy</button>
              {activePod === pod.id && (
                <button
                  onClick={leavePod}
                  className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs ml-2"
                  title="Leave Pod"
                >Leave</button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {activePod && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Pod Members:</h4>
          <ul>
            {podMembers.map(m => (
              <li key={m.uid} className="mb-1 flex items-center gap-2">
                {m.displayName} <span className="text-xs text-gray-400">({m.uid})</span>
                {podData?.members?.[0] === m.uid && (
                  <span className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded text-xs">Admin</span>
                )}
                {isAdmin && m.uid !== podData?.members?.[0] && (
                  <button
                    onClick={() => handleRemoveMember(m.uid)}
                    className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs ml-2"
                    title="Remove Member"
                  >Remove</button>
                )}
              </li>
            ))}
          </ul>
          {isAdmin && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={addUid}
                onChange={e => setAddUid(e.target.value)}
                placeholder="Add member UID"
                // Bug #9 Fix: Add bg-white/10 and text-white
                className="px-3 py-1 rounded-lg border border-white/20 bg-white/10 text-white"
              />
              <button
                onClick={handleAddMember}
                className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
              >Add Member</button>
              {adminStatus && <span className="text-yellow-300 ml-2">{adminStatus}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PodManager;
