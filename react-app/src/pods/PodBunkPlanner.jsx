import React, { useContext, useState } from 'react';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';
import ReactMarkdown from 'react-markdown';

const PodBunkPlanner = ({ getGroupBunkRecommendation }) => {
  const { podMembers } = useContext(PodContext);
  const { currentUser } = useContext(UserContext);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (uid) => {
    setSelectedMembers(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleSelectAll = () => {
    const peers = podMembers.filter(m => m.uid !== currentUser?.uid).map(m => m.uid);
    if (selectedMembers.length === peers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(peers);
    }
  };

  const handlePlan = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await getGroupBunkRecommendation(selectedMembers);
      setResult(res);
    } catch (e) {
      setResult('Failed to analyze group bunk schedule: ' + (e.message || e));
    }
    setLoading(false);
  };

  const peerMembers = podMembers.filter(m => m.uid !== currentUser?.uid);

  return (
    <div className="apple-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i className="fas fa-calendar-alt text-sky-400"></i>
            Collaborative Pod Bunk Planner
          </h3>
          <p className="text-xs text-white/50">Run multi-student schedule synergy analysis to calculate safe, minimal-impact bunk windows.</p>
        </div>
        {peerMembers.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors self-start sm:self-auto"
          >
            {selectedMembers.length === peerMembers.length ? 'Deselect All' : 'Select All Classmates'}
          </button>
        )}
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2 block">
          Select Peer Pod Members to Coordinate:
        </label>
        
        {peerMembers.length === 0 ? (
          <p className="text-xs text-white/40 italic py-2">Invite friends to your pod to coordinate combined bunk periods.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {peerMembers.map(m => {
              const isChecked = selectedMembers.includes(m.uid);
              return (
                <div
                  key={m.uid}
                  onClick={() => handleSelect(m.uid)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 text-xs ${
                    isChecked 
                      ? 'bg-sky-500/15 border-sky-400/40 text-white font-medium' 
                      : 'bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    isChecked ? 'bg-sky-500 border-sky-500 text-white' : 'border-white/30'
                  }`}>
                    {isChecked && <i className="fas fa-check text-[9px]"></i>}
                  </div>
                  <span className="truncate">{m.displayName}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handlePlan}
          disabled={selectedMembers.length === 0 || loading}
          className="apple-btn-primary text-xs px-5 py-2.5 flex items-center gap-2 disabled:opacity-40"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin text-xs"></i>
              <span>Simulating Schedule Impacts...</span>
            </>
          ) : (
            <>
              <i className="fas fa-wand-magic-sparkles text-xs"></i>
              <span>Find Optimal Pod Bunk Day</span>
            </>
          )}
        </button>

        {selectedMembers.length > 0 && (
          <span className="text-xs text-white/50 font-mono">
            {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} active
          </span>
        )}
      </div>

      {result && (
        <div className="mt-5 p-5 rounded-2xl bg-white/[0.03] border border-white/10 prose-apple">
          <div className="flex items-center gap-2 mb-3 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <i className="fas fa-chart-line"></i> Recommendation Report
          </div>
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default PodBunkPlanner;
