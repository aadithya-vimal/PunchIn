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
  const { currentUser, attendanceData, subjects, getProfileStats } = useContext(UserContext);

  // Helper to calculate overall attendance for a user
  const calculateOverallAttendance = (memberUid) => {
    // If current user, use local attendanceData
    if (memberUid === currentUser?.uid) {
      const stats = getProfileStats();
      return stats.overallAttendance === '--' ? 0 : Number(stats.overallAttendance);
    }
    // For other members, attendanceData is not available locally, so use podMember.attendanceData if present
    const member = podMembers.find(m => m.uid === memberUid);
    if (member && member.attendanceData) {
      let totalAttended = 0;
      let totalClasses = 0;
      Object.values(member.attendanceData).forEach(data => {
        totalAttended += Number(data.attended) || 0;
        totalClasses += Number(data.total) || 0;
      });
      return totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(2) : 0;
    }
    // If not available, show 0
    return 0;
  };

  // Engagement and isLeader logic (can be improved if engagement data is available)
  const getStats = (uid) => {
    return {
      attendance: calculateOverallAttendance(uid),
      engagement: 0, // Placeholder, replace with real engagement if available
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
