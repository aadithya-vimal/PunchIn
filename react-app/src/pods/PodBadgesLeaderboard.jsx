import React, { useContext } from 'react';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';

const badgeMeta = {
  attendance: { label: 'Attendance Ace', icon: 'fa-shield-check', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  engagement: { label: 'Active Contributor', icon: 'fa-bolt', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  leader: { label: 'Pod Lead', icon: 'fa-crown', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

function getBadges(memberStats) {
  const badges = [];
  if (memberStats.attendance >= 85) badges.push('attendance');
  if (memberStats.engagement >= 1) badges.push('engagement');
  if (memberStats.isLeader) badges.push('leader');
  return badges;
}

const PodBadgesLeaderboard = () => {
  const { podMembers, podData } = useContext(PodContext);
  const { currentUser, getProfileStats } = useContext(UserContext);

  const calculateOverallAttendance = (memberUid) => {
    if (memberUid === currentUser?.uid) {
      const stats = getProfileStats();
      return stats.overallAttendance === '--' ? 0 : Number(stats.overallAttendance);
    }
    const member = podMembers.find(m => m.uid === memberUid);
    if (member && member.attendanceData) {
      let totalAttended = 0;
      let totalClasses = 0;
      Object.values(member.attendanceData).forEach(data => {
        totalAttended += Number(data.attended) || 0;
        totalClasses += Number(data.total) || 0;
      });
      return totalClasses > 0 ? Number(((totalAttended / totalClasses) * 100).toFixed(1)) : 0;
    }
    return 0;
  };

  const getStats = (uid) => {
    const isOwner = podData?.members?.[0] === uid;
    const att = calculateOverallAttendance(uid);
    return {
      attendance: att,
      engagement: isOwner ? 2 : 1,
      isLeader: isOwner,
    };
  };

  if (!podData?.members?.length) return null;

  return (
    <div className="apple-card p-6 mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i className="fas fa-trophy text-amber-400"></i>
            Pod Standings & Merit Badges
          </h3>
          <p className="text-xs text-white/50">Recognition badges based on attendance discipline and team participation.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Student</th>
              <th className="py-2.5 px-3">Aggregate %</th>
              <th className="py-2.5 px-3">Activity Tier</th>
              <th className="py-2.5 px-3">Earned Badges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {podMembers.map((m, idx) => {
              const stats = getStats(m.uid);
              const badges = getBadges(stats);
              const isSelf = m.uid === currentUser?.uid;

              return (
                <tr key={m.uid} className={`transition-colors ${isSelf ? 'bg-sky-500/[0.06]' : 'hover:bg-white/[0.02]'}`}>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-white/40 w-4">#{idx + 1}</span>
                      <span className="font-medium text-white">{isSelf ? 'You' : m.displayName}</span>
                      {isSelf && <span className="text-[10px] text-sky-400 font-mono">(Current)</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold">
                    <span className={stats.attendance >= 85 ? 'text-emerald-400' : stats.attendance >= 75 ? 'text-sky-400' : 'text-rose-400'}>
                      {stats.attendance > 0 ? `${stats.attendance}%` : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="apple-badge text-[10px] py-0.5">
                      Tier {stats.engagement}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map(b => {
                        const meta = badgeMeta[b];
                        return (
                          <span 
                            key={b} 
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.color}`}
                            title={meta.label}
                          >
                            <i className={`fas ${meta.icon}`}></i>
                            <span>{meta.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PodBadgesLeaderboard;
