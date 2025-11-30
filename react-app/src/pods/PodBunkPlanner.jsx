import React, { useContext, useState } from 'react';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';
import DisclaimerModal from './DisclaimerModal';
import ReactMarkdown from 'react-markdown';

const PodBunkPlanner = ({ getGroupBunkRecommendation }) => {
  const { podMembers } = useContext(PodContext);
  const { currentUser } = useContext(UserContext);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (uid) => {
    setSelectedMembers(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handlePlan = async () => {
    setLoading(true);
    setResult('');
    const res = await getGroupBunkRecommendation(selectedMembers);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Collaborative Pod Bunk Planner</h3>
      <div className="mb-4">Select members to coordinate a group bunk:</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {podMembers.map(m => (
          <label key={m.uid} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedMembers.includes(m.uid)}
              onChange={() => handleSelect(m.uid)}
              disabled={m.uid === currentUser?.uid}
            />
            {m.uid === currentUser?.uid ? 'You' : m.displayName}
          </label>
        ))}
      </div>
      <button
        onClick={handlePlan}
        disabled={selectedMembers.length === 0 || loading}
        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
      >Find Our Best Bunk Day</button>
      {loading && <div className="mt-4 text-yellow-400">Analyzing group schedule...</div>}
      {result && (
        <div className="mt-4 p-4 bg-black/10 rounded-lg whitespace-pre-wrap prose prose-invert max-w-none">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default PodBunkPlanner;
