import React, { useContext } from 'react';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';

const badgeIcons = {
  attendance: '✅',
  engagement: '🎉',
  leader: '🏆',
};

function getBadges(memberStats) {
  const badges = [];
  if (memberStats.attendance >= 90) badges.push('attendance');
  if (memberStats.engagement >= 5) badges.push('engagement');
  if (memberStats.isLeader) badges.push('leader');
  return badges;
}

const PodBadgesLeaderboard = () => {
  const { podMembers, podData } = useContext(PodContext);
  const { currentUser } = useContext(UserContext);

  // Dummy stats for demo; replace with real stats
  const getStats = (uid) => {
    return {
      attendance: Math.floor(Math.random() * 30) + 70, // 70-100%
      engagement: Math.floor(Math.random() * 10), // 0-10 actions
      isLeader: podData?.members?.[0] === uid,
    };
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Pod Leaderboard & Badges</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/20">
            <th className="py-2">Member</th>
            <th className="py-2">Attendance</th>
            <th className="py-2">Engagement</th>
            <th className="py-2">Badges</th>
          </tr>
        </thead>
        <tbody>
          {podMembers.map(m => {
            const stats = getStats(m.uid);
            const badges = getBadges(stats);
            return (
              <tr key={m.uid} className="border-b border-white/10">
                <td className="py-2">{m.uid === currentUser?.uid ? 'You' : m.displayName}</td>
                <td className="py-2">{stats.attendance}%</td>
                <td className="py-2">{stats.engagement}</td>
                <td className="py-2">
                  {badges.map(b => (
                    <span key={b} title={b} className="mr-2 text-lg">{badgeIcons[b]}</span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PodBadgesLeaderboard;
