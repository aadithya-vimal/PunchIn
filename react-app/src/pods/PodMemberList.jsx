import React, { useContext, useState } from 'react';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';

const PodMemberList = ({ onSelectMember, onCopyMemberData }) => {
  const { podMembers, podData, getMemberData, getMemberDisplayName } = useContext(PodContext);
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [selectedUid, setSelectedUid] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);

  const handleSelect = async (uid) => {
    setLoading(true);
    setSelectedUid(uid);
    const data = await getMemberData(uid);
    setMemberInfo(data);
    setLoading(false);
    if (onSelectMember) onSelectMember(uid, data);
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Pod Members</h3>
      <ul>
        {podMembers.map(m => (
          <li key={m.uid} className="mb-2 flex items-center gap-2">
            <button
              onClick={() => handleSelect(m.uid)}
              disabled={loading || m.uid === currentUser?.uid}
              className={`px-3 py-1 rounded-lg ${selectedUid === m.uid ? 'bg-indigo-600 text-white' : 'bg-white/20 text-black'} ${m.uid === currentUser?.uid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >{m.uid === currentUser?.uid ? 'You' : m.displayName}</button>
            {m.uid !== currentUser?.uid && (
              <>
                <button
                  onClick={() => handleCopy(m.uid)}
                  title="Copy User ID"
                  className="bg-gray-700 hover:bg-gray-900 text-white px-2 py-1 rounded text-xs"
                >Copy</button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    const data = await getMemberData(m.uid);
                    setLoading(false);
                    if (onCopyMemberData) onCopyMemberData(m.uid, data);
                  }}
                  title="Copy Subjects & Timetable"
                  className="bg-indigo-700 hover:bg-indigo-900 text-white px-2 py-1 rounded text-xs"
                >Copy Data</button>
              </>
            )}
          </li>
        ))}
      </ul>
      {memberInfo && (
        <div className="mt-4 p-4 bg-black/10 rounded-lg">
          <h4 className="font-semibold mb-2">Selected Member's Data</h4>
          <div><strong>Subjects:</strong> {memberInfo.subjects?.join(', ') || 'None'}</div>
          <div><strong>Timetable:</strong> {JSON.stringify(memberInfo.timetable) || 'None'}</div>
        </div>
      )}
    </div>
  );
};

export default PodMemberList;
