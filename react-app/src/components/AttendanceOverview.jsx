import React, { useContext, useState, useRef, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import EditPercentageModal from './EditPercentageModal.jsx';

const StatCard = ({ title, percentage, attended, total, isOverall = false, isSecondary = false, onEdit, children }) => {
  const isOk = !isNaN(percentage) && percentage >= 75;
  const isHigh = !isNaN(percentage) && percentage >= 85;

  const colorHex = isNaN(percentage)
    ? '#64748b'
    : percentage < 75
      ? '#f43f5e'
      : percentage < 85
        ? '#38bdf8'
        : '#10b981';

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = isNaN(percentage) ? circumference : circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  let cardStyle = 'apple-card p-4 flex flex-col justify-between relative group';
  if (isOverall) {
    cardStyle = 'apple-card p-4 flex flex-col justify-between relative border-sky-500/30 bg-sky-950/20 shadow-sky-950/20';
  } else if (isSecondary) {
    cardStyle = 'apple-card p-4 flex flex-col justify-between relative border-emerald-500/30 bg-emerald-950/20';
  }

  return (
    <div className={cardStyle}>
      <div className="w-full flex items-start justify-between gap-1 mb-2">
        <h4 
          className="text-xs font-semibold text-white/90 line-clamp-2 leading-tight tracking-tight pr-1"
          title={title}
        >
          {title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              title="Edit attendance percentage directly"
              className="opacity-40 group-hover:opacity-100 hover:bg-white/10 p-1 rounded-md text-white/60 hover:text-white transition-opacity text-[11px]"
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
          {children}
        </div>
      </div>
      
      {/* Circle meter */}
      <div className="flex flex-col items-center justify-center my-1">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full" viewBox="0 0 64 64">
            <circle
              className="text-white/[0.06]"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
            <circle
              stroke={colorHex}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
              transform="rotate(-90 32 32)"
              className="transition-all duration-700 ease-out"
            />
            <text
              x="32"
              y="32"
              fill="#ffffff"
              fontWeight="700"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {isNaN(percentage) ? '—' : `${percentage.toFixed(1)}%`}
            </text>
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-white/50 font-mono">
        <span>Attended</span>
        <span className="text-white/80 font-medium">{Number(attended)}/{Number(total)}</span>
      </div>
    </div>
  );
};

const AttendanceOverview = () => {
  const { subjects, attendanceData, toggleSubjectExclusion, setSubjectPercentage } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingItems, setLoadingItems] = useState({});
  const [editingSubject, setEditingSubject] = useState(null);
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
    if (loadingItems[index]) return;
    setLoadingItems(prev => ({ ...prev, [index]: true }));
    toggleSubjectExclusion(index);
    setTimeout(() => {
      setLoadingItems(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }, 250);
  };

  const handleSavePercentage = async (targetPct, totalClasses) => {
    if (editingSubject !== null) {
      await setSubjectPercentage(editingSubject.index, targetPct, totalClasses);
      setEditingSubject(null);
    }
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
      <div className="mb-10 apple-card p-8 text-center border-dashed border-white/10">
        <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-white/50 mb-3">
          <i className="fas fa-layer-group text-lg"></i>
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No Course Attendance Tracked</h3>
        <p className="text-xs text-white/50 max-w-sm mx-auto">
          Add your subjects from the sidebar or import your schedule from a peer Pod to begin calculating attendance stats.
        </p>
      </div>
    );
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Attendance Overview</h2>
          <p className="text-xs text-white/50">Real-time status across official and customizable aggregate pools</p>
        </div>
        <span className="apple-badge hidden sm:inline-flex">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Sync
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {/* Official overall */}
        <StatCard
          title="Overall Official"
          percentage={overallPercentage}
          attended={totalAttended}
          total={totalClasses}
          isOverall={true}
        />

        {/* Custom Aggregate */}
        <StatCard
          title="Custom Aggregate"
          percentage={customPercentage}
          attended={customAttended}
          total={customTotal}
          isSecondary={true}
        >
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              title="Filter Aggregate Subjects"
            >
              <i className="fas fa-filter text-[10px]"></i>
            </button>

            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 top-6 w-56 bg-[#0f131c]/95 border border-white/15 rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-xl max-h-60 overflow-y-auto text-left"
              >
                <div className="text-[10px] font-bold text-white/40 mb-2 px-2 uppercase tracking-wider">Include in Custom:</div>
                {subjects.map((sub, idx) => {
                  const isExcluded = attendanceData[idx]?.isExcluded;
                  const isLoading = loadingItems[idx];

                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleToggle(idx)}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors text-xs"
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${!isExcluded ? 'bg-sky-500 border-sky-500' : 'border-white/30'}`}>
                        {isLoading ? (
                          <i className="fas fa-spinner fa-spin text-[8px] text-white"></i>
                        ) : (
                          !isExcluded && <i className="fas fa-check text-[8px] text-white"></i>
                        )}
                      </div>
                      <span className={`truncate ${isExcluded ? 'text-white/40 line-through' : 'text-white/90'}`}>{sub}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </StatCard>

        {/* Individual subjects */}
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
              onEdit={() => setEditingSubject({ subject, index, percentage, attended: attendedNum, total: totalNum })}
            />
          );
        })}
      </div>

      {/* Edit Percentage Modal if triggered */}
      {editingSubject && (
        <EditPercentageModal
          subjectName={editingSubject.subject}
          currentPercentage={editingSubject.percentage}
          currentAttended={editingSubject.attended}
          currentTotal={editingSubject.total}
          onSave={handleSavePercentage}
          onClose={() => setEditingSubject(null)}
        />
      )}
    </section>
  );
};

export default AttendanceOverview;
