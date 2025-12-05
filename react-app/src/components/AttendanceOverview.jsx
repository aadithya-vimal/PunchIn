import React, { useContext, useState, useRef, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const StatCard = ({ title, percentage, attended, total, isOverall = false, isSecondary = false, children }) => {
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

  let titleClass = "font-medium leading-tight h-10 flex items-center justify-center text-center w-full";
  if (title.length > 25) titleClass += " text-xs";
  else if (title.length > 15) titleClass += " text-sm";
  else titleClass += " text-base";

  let cardStyle = 'bg-white/10';
  if (isOverall) cardStyle = 'bg-white/5 border-2 border-indigo-500/50';
  if (isSecondary) cardStyle = 'bg-white/5 border-2 border-pink-500/50 relative'; 

  return (
    <div className={`p-3 rounded-xl flex flex-col items-center justify-between text-center ${cardStyle}`}>
      <div className="w-full flex justify-center relative">
        <p className={titleClass}>{title}</p>
        {children} 
      </div>
      
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
  const { subjects, attendanceData, toggleSubjectExclusion } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  // NEW: Track loading state for each subject ID
  const [loadingItems, setLoadingItems] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (index) => {
      if (loadingItems[index]) return; // Prevent double click

      // Set loading state
      setLoadingItems(prev => ({ ...prev, [index]: true }));
      
      // Perform update
      toggleSubjectExclusion(index);

      // Remove loading state after a short delay to smooth the visual transition
      setTimeout(() => {
          setLoadingItems(prev => {
              const newState = { ...prev };
              delete newState[index];
              return newState;
          });
      }, 300);
  };

  // 1. Standard Overall
  const totalAttended = Object.values(attendanceData).reduce((sum, data) => sum + Number(data.attended || 0), 0);
  const totalClasses = Object.values(attendanceData).reduce((sum, data) => sum + Number(data.total || 0), 0);
  const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : NaN;

  // 2. Custom Overall
  let customAttended = 0;
  let customTotal = 0;

  subjects.forEach((_, index) => {
    const data = attendanceData[index] || { attended: 0, total: 0 };
    if (!data.isExcluded) {
        customAttended += Number(data.attended || 0);
        customTotal += Number(data.total || 0);
    }
  });

  const customPercentage = customTotal > 0 ? (customAttended / customTotal) * 100 : NaN;

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
      <h2 className="text-2xl font-bold mb-6 text-center">Attendance Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        
        <StatCard
          title="Overall (Official)"
          percentage={overallPercentage}
          attended={totalAttended}
          total={totalClasses}
          isOverall={true}
        />

        <StatCard
          title="Custom Aggregate"
          percentage={customPercentage}
          attended={customAttended}
          total={customTotal}
          isSecondary={true}
        >
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="absolute top-0 right-0 p-1 text-white/50 hover:text-white transition-colors"
                title="Filter Subjects"
            >
                <i className="fas fa-filter text-xs"></i>
            </button>

            {showDropdown && (
                <div 
                    ref={dropdownRef}
                    className="absolute top-8 left-0 w-full min-w-[200px] bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-50 p-2 text-left max-h-60 overflow-y-auto"
                >
                    <div className="text-xs font-bold text-white/50 mb-2 px-2 uppercase tracking-wider">Include in Custom:</div>
                    {subjects.map((sub, idx) => {
                        const isExcluded = attendanceData[idx]?.isExcluded;
                        const isLoading = loadingItems[idx];

                        return (
                            <div 
                                key={idx} 
                                onClick={() => handleToggle(idx)}
                                className={`flex items-center gap-2 px-2 py-2 hover:bg-white/10 rounded cursor-pointer transition-colors ${isLoading ? 'opacity-70' : ''}`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${!isExcluded ? 'bg-indigo-600 border-indigo-600' : 'border-white/30'}`}>
                                    {isLoading ? (
                                        <i className="fas fa-spinner fa-spin text-[10px] text-white"></i>
                                    ) : (
                                        !isExcluded && <i className="fas fa-check text-[10px] text-white"></i>
                                    )}
                                </div>
                                <span className={`text-sm truncate ${isExcluded ? 'text-white/50' : 'text-white'}`}>{sub}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </StatCard>

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