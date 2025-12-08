import React, { createContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import useAutoPunch from '../hooks/useAutoPunch';

export const UserContext = createContext();

const getInitialAttendanceData = () => {
  try {
    const stored = localStorage.getItem('attendanceData');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const DEFAULT_TIMINGS = {
    "1": "09:00",
    "2": "10:00",
    "3": "11:00",
    "4": "12:00",
    "5": "14:00",
    "6": "15:00",
    "7": "16:00",
    "8": "17:00"
};

export const UserProvider = ({ children }) => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [subjects, setSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState(getInitialAttendanceData);
  const [timetable, setTimetable] = useState({});
  const [profile, setProfile] = useState({});
  const [lastPunch, setLastPunch] = useState(null);
  const [dailyOverrides, setDailyOverrides] = useState({});
  
  // Auto Punch Settings
  const [autoPunch, setAutoPunch] = useState(false);
  const [classTimings, setClassTimings] = useState(DEFAULT_TIMINGS);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [missedAttendance, setMissedAttendance] = useState(null);

  const attendanceSaveTimer = useRef(null);
  const attendanceDataRef = useRef(attendanceData);
  const [pendingUpdates, setPendingUpdates] = useState(new Set());

  // --- SYNC ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      
      if (!user) {
        setSubjects([]);
        setAttendanceData({});
        setTimetable({});
        setProfile({});
        setLastPunch(null);
        setDailyOverrides({});
        setAutoPunch(false);
        setClassTimings(DEFAULT_TIMINGS);
        setSelectedSubjects([]);
        localStorage.removeItem('attendanceData');
      } else {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeData = onSnapshot(userDocRef, (docSnap) => {
          if (pendingUpdates.size > 0) return; 
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubjects(data.subjects || []);
            setAttendanceData(data.attendanceData || {});
            setTimetable(data.timetable || {});
            setProfile(data.profile || {});
            setLastPunch(data.lastPunch || null);
            setDailyOverrides(data.dailyOverrides || {});
            setAutoPunch(data.autoPunch || false);
            setClassTimings(data.classTimings || DEFAULT_TIMINGS);
          }
        });
        return () => unsubscribeData();
      }
    });
    return () => unsubscribeAuth();
  }, [pendingUpdates.size]);

  useEffect(() => {
    attendanceDataRef.current = attendanceData;
    const timeout = setTimeout(() => {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }, 100);
    return () => clearTimeout(timeout);
  }, [attendanceData]);

  // --- AUTH HELPER ---
  const logout = () => {
    signOut(auth).catch((error) => console.error("Logout Error:", error));
  };

  // --- SAVE HELPERS ---
  const saveData = async (dataToSave) => {
    if (!currentUser) return;
    
    // Optimistic Updates
    if ('subjects' in dataToSave) setSubjects(dataToSave.subjects);
    if ('attendanceData' in dataToSave) setAttendanceData(dataToSave.attendanceData);
    if ('timetable' in dataToSave) setTimetable(dataToSave.timetable);
    if ('profile' in dataToSave) setProfile(dataToSave.profile);
    if ('dailyOverrides' in dataToSave) setDailyOverrides(dataToSave.dailyOverrides);
    if ('autoPunch' in dataToSave) setAutoPunch(dataToSave.autoPunch);
    if ('classTimings' in dataToSave) setClassTimings(dataToSave.classTimings);

    try {
      await setDoc(doc(db, 'users', currentUser.uid), dataToSave, { merge: true });
    } catch (e) { console.error("Save Error:", e); }
  };

  const saveSubjectAttendance = async (subjectIndex, newSubjectData) => {
    if (!currentUser) return;
    try { 
      await updateDoc(doc(db, 'users', currentUser.uid), { 
        [`attendanceData.${subjectIndex}`]: newSubjectData 
      }); 
    } catch (e) { console.error(e); }
  };

  const toggleSubjectExclusion = (index) => {
      setAttendanceData(prev => {
          const updated = { ...prev };
          const subjectData = updated[index] ? { ...updated[index] } : { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
          subjectData.isExcluded = !subjectData.isExcluded;
          updated[index] = subjectData;
          return updated;
      });
      if(attendanceSaveTimer.current) clearTimeout(attendanceSaveTimer.current);
      attendanceSaveTimer.current = setTimeout(() => saveData({attendanceData: attendanceDataRef.current}), 1000);
  };

  const markSubstitution = async (date, period, newSubjectIndex) => {
      const updatedOverrides = { ...dailyOverrides };
      if (!updatedOverrides[date]) updatedOverrides[date] = {};
      updatedOverrides[date][period] = parseInt(newSubjectIndex, 10);
      setDailyOverrides(updatedOverrides);
      if (currentUser) {
          try {
              await updateDoc(doc(db, 'users', currentUser.uid), { 
                  [`dailyOverrides.${date}.${period}`]: parseInt(newSubjectIndex, 10)
              });
          } catch(e) { console.error(e); }
      }
  };

  const handlePunch = (subjectIndex, period, status, isUndo = false) => {
    const todayDate = new Date().toISOString().slice(0, 10);
    let currentSubjectData = attendanceData[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
    const oldData = { ...currentSubjectData };
    let attended = Number(oldData.attended) || 0;
    let total = Number(oldData.total) || 0;
    const dailyStatus = JSON.parse(JSON.stringify(oldData.dailyStatus || {}));
    const day = dailyStatus[todayDate] ? { ...dailyStatus[todayDate] } : {};

    if (isUndo) {
        if (!day[period]) return;
        const lastStatus = day[period];
        delete day[period];
        if (Object.keys(day).length === 0) delete dailyStatus[todayDate];
        else dailyStatus[todayDate] = day;
        if (lastStatus === 'attended' && attended > 0) attended--;
        if ((lastStatus === 'attended' || lastStatus === 'bunked') && total > 0) total--;
    } else {
        if (day[period]) return;
        day[period] = status;
        dailyStatus[todayDate] = day;
        total++;
        if (status === 'attended') attended++;
    }

    const updatedSubjectData = { ...oldData, attended, total, dailyStatus };
    setAttendanceData(prev => ({ ...prev, [subjectIndex]: updatedSubjectData }));
    
    const updateKey = `punch-${subjectIndex}-${period}`;
    setPendingUpdates(prev => new Set(prev).add(updateKey));
    
    if (!isUndo) {
        const now = new Date();
        const meta = {
            subjectName: subjects[subjectIndex] || "Unknown",
            period, status, date: now.toLocaleDateString(),
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setLastPunch(meta);
        updateDoc(doc(db, 'users', currentUser.uid), { lastPunch: meta });
    }

    saveSubjectAttendance(subjectIndex, updatedSubjectData).finally(() => {
        setPendingUpdates(prev => { const n = new Set(prev); n.delete(updateKey); return n; });
    });
  };

  const batchPunchIn = (sessions) => {
    const newData = JSON.parse(JSON.stringify(attendanceData));
    sessions.forEach(({ date, period, subjectIndex, status }) => {
        if (!newData[subjectIndex]) newData[subjectIndex] = { attended: 0, total: 0, dailyStatus: {} };
        if (!newData[subjectIndex].dailyStatus[date]) newData[subjectIndex].dailyStatus[date] = {};
        if (!newData[subjectIndex].dailyStatus[date][period]) {
            newData[subjectIndex].dailyStatus[date][period] = status;
            newData[subjectIndex].total = (Number(newData[subjectIndex].total) || 0) + 1;
            if (status === 'attended') newData[subjectIndex].attended = (Number(newData[subjectIndex].attended) || 0) + 1;
        }
    });
    setAttendanceData(newData);
    saveData({ attendanceData: newData });
    if (sessions.length > 0) {
        const now = new Date();
        const meta = { subjectName: "Auto/Batch", period: "-", status: "Multiple", date: now.toLocaleDateString(), time: now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
        setLastPunch(meta);
        updateDoc(doc(db, 'users', currentUser.uid), { lastPunch: meta });
    }
    setActiveModal(null);
  };

  // --- USE AUTO PUNCH HOOK ---
  useAutoPunch({
    autoPunch,
    timetable,
    attendanceData,
    subjects,
    classTimings,
    dailyOverrides,
    batchPunchIn
  });

  const checkForMissedAttendance = (startDateInput, endDateInput) => {
    if (!timetable || Object.keys(timetable).length === 0) return "No timetable.";
    const today = new Date();
    today.setHours(0,0,0,0);
    let start = startDateInput ? new Date(startDateInput) : new Date(today);
    let end = endDateInput ? new Date(endDateInput) : new Date(today);
    if (!startDateInput) { start.setDate(today.getDate() - 7); end.setDate(today.getDate() - 1); }

    const missedSessions = [];
    const daysChecked = [];

    for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const daySchedule = timetable[dayName];
        if (daySchedule && Object.keys(daySchedule).length > 0) {
            const hasData = Object.values(attendanceData).some(sub => sub.dailyStatus && sub.dailyStatus[dateStr]);
            if (!hasData) {
                daysChecked.push(new Date(d));
                Object.entries(daySchedule).forEach(([period, subjectIndex]) => {
                    const overrideIndex = dailyOverrides[dateStr]?.[period];
                    const finalIndex = overrideIndex !== undefined ? overrideIndex : subjectIndex;
                    if (subjects[finalIndex]) {
                        missedSessions.push({
                            date: dateStr,
                            displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }),
                            dayName, period, subjectIndex: finalIndex, subjectName: subjects[finalIndex]
                        });
                    }
                });
            }
        }
    }
    const rangeStr = daysChecked.length > 0 ? `${daysChecked[daysChecked.length-1].toLocaleDateString()} to ${daysChecked[0].toLocaleDateString()}` : `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
    setMissedAttendance({ daysMissed: daysChecked.length, dateRange: rangeStr, sessions: missedSessions });
    setActiveModal('missedAttendance');
  };

  const getProfileStats = () => {
    let tA = 0, tC = 0;
    Object.values(attendanceData).forEach(d => { tA += Number(d.attended)||0; tC += Number(d.total)||0; });
    const overall = tC > 0 ? (tA / tC) * 100 : NaN;
    return { totalSubjects: subjects.length, overallAttendance: isNaN(overall) ? '--' : overall.toFixed(2) };
  };

  const value = {
    currentUser, subjects, attendanceData, timetable, profile, isLoading, 
    activeModal, setActiveModal, closeModal: () => setActiveModal(null),
    isAdmin, lastPunch, dailyOverrides,
    // Export Auto Punch State & Setters
    autoPunch, classTimings,
    logout, // <--- ADDED LOGOUT HERE
    
    saveData, saveSubjects: (names) => saveData({ subjects: names }), 
    updateAttendanceData: (idx, field, val) => {
        setAttendanceData(prev => { 
            const u = {...prev}; 
            if(!u[idx]) u[idx]={attended:'', total:''}; 
            u[idx][field]=val; 
            return u; 
        });
        if(attendanceSaveTimer.current) clearTimeout(attendanceSaveTimer.current);
        attendanceSaveTimer.current = setTimeout(() => saveData({attendanceData: attendanceDataRef.current}), 1500);
    },
    punchIn: (idx, p, status) => handlePunch(idx, p, status, false),
    undoPunchIn: (idx, p) => handlePunch(idx, p, null, true),
    checkForMissedAttendance, missedAttendance, batchPunchIn, markSubstitution,
    toggleSubjectExclusion, 
    selectedSubjects, setSelectedSubjects,
    handleSelectSubject: (i) => setSelectedSubjects(p => p.includes(i) ? p.filter(x=>x!==i) : [...p,i]),
    getProfileStats
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};