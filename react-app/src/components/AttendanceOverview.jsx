import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const StatCard = ({ title, percentage, attended, total, isOverall = false }) => {
  const colorClass = isNaN(percentage)
    ? 'text-gray-400'
    : percentage < 75
      ? 'text-red-400'
      : percentage < 85
        ? 'text-yellow-400'
        : 'text-green-400';

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = isNaN(percentage) ? circumference : circumference - (percentage / 100) * circumference;

  let titleClass = "font-medium leading-tight h-10 flex items-center justify-center text-center";
  if (title.length > 25) titleClass += " text-xs";
  else if (title.length > 15) titleClass += " text-sm";
  else titleClass += " text-base";

  return (
    <div className={`p-3 rounded-xl flex flex-col items-center justify-between text-center ${isOverall ? 'bg-white/5 border-2 border-indigo-500/50' : 'bg-white/10'}`}>
      <p className={titleClass}>{title}</p>
      <div className="relative w-20 h-20 my-1">
        <svg className="w-full h-full" viewBox="0 0 64 64">
          <circle
            className="text-white/10"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
          <circle
            className={`${colorClass} transition-all duration-500`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
            transform="rotate(-90 32 32)"
          />
          <text
            x="32"
            y="32"
            fill="currentColor"
            fontWeight="bold"
            fontSize="11"
            textAnchor="middle"
            dominantBaseline="middle"
            className={colorClass}
          >
            {isNaN(percentage) ? '--' : `${percentage.toFixed(2)}%`}
          </text>
        </svg>
      </div>
      <p className="text-xs text-white/70">{Number(attended)} / {Number(total)}</p>
    </div>
  );
};

const AttendanceOverview = () => {
  const { subjects, attendanceData } = useContext(UserContext);

  const totalAttended = Object.values(attendanceData).reduce((sum, data) => sum + Number(data.attended || 0), 0);
  const totalClasses = Object.values(attendanceData).reduce((sum, data) => sum + Number(data.total || 0), 0);
  const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : NaN;

  if (subjects.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-6 text-center">Attendance Overview</h2>
        <div className="bg-white/10 rounded-xl p-6">
          <p className="text-center text-white/60">No subjects found. Add subjects to see your overview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Attendance Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <StatCard
          title="Overall"
          percentage={overallPercentage}
          attended={totalAttended}
          total={totalClasses}
          isOverall={true}
        />
        {subjects.map((subject, index) => {
          const data = attendanceData[index] || { attended: 0, total: 0 };
          const attendedNum = Number(data.attended || 0);
          const totalNum = Number(data.total || 0);
          const percentage = totalNum > 0 ? (attendedNum / totalNum) * 100 : NaN;
          return (
            <StatCard
              key={index}
              title={subject}
              percentage={percentage}
              attended={attendedNum}
              total={totalNum}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceOverview;
