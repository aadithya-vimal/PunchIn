import React, { createContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const UserContext = createContext();

const getInitialAttendanceData = () => {
  try {
    const stored = localStorage.getItem('attendanceData');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState(getInitialAttendanceData);
  const [timetable, setTimetable] = useState({});
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastPunch, setLastPunch] = useState(null);
  
  const [pendingUpdates, setPendingUpdates] = useState(new Set());
  const attendanceSaveTimer = useRef(null);
  const attendanceDataRef = useRef(attendanceData);
  const [missedAttendance, setMissedAttendance] = useState(null);

  const validateData = (data) => {
    if ('subjects' in data && (!Array.isArray(data.subjects) || data.subjects.some(s => typeof s !== 'string' || !s.trim()))) return false;
    if ('attendanceData' in data && typeof data.attendanceData !== 'object') return false;
    if ('timetable' in data && typeof data.timetable !== 'object') return false;
    if ('profile' in data && typeof data.profile !== 'object') return false;
    return true;
  };

  const saveData = async (dataToSave, options = {}) => {
    if (!currentUser) return;
    if (options.confirmDestructive) {
      if (!window.confirm('Are you sure?')) return;
    }
    if (!validateData(dataToSave)) return;

    if ('subjects' in dataToSave) setSubjects(dataToSave.subjects);
    if ('attendanceData' in dataToSave) setAttendanceData(dataToSave.attendanceData);
    if ('timetable' in dataToSave) setTimetable(dataToSave.timetable);
    if ('profile' in dataToSave) setProfile(dataToSave.profile);

    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await setDoc(userDocRef, dataToSave, { merge: true });
    } catch (e) { console.error(e); }
  };

  const saveSubjects = (newSubjectNames) => {
    const oldDataMap = new Map();
    subjects.forEach((oldSubject, oldIndex) => {
      oldDataMap.set(oldSubject, attendanceData[oldIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} });
    });
    const newAttendanceData = {};
    newSubjectNames.forEach((newSubject, newIndex) => {
      newAttendanceData[newIndex] = oldDataMap.get(newSubject) || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
    });
    const newTimetable = {};
    Object.entries(timetable).forEach(([day, periods]) => {
      newTimetable[day] = {};
      Object.entries(periods).forEach(([period, subjectIndex]) => {
        const oldSubjectName = subjects[subjectIndex];
        const newIndex = newSubjectNames.indexOf(oldSubjectName);
        if (newIndex !== -1) newTimetable[day][period] = newIndex;
      });
    });
    setSelectedSubjects([]);
    saveData({ subjects: newSubjectNames, attendanceData: newAttendanceData, timetable: newTimetable });
  };

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
        setSelectedSubjects([]);
        setIsAdmin(false);
        localStorage.removeItem('attendanceData');
      } else {
        setIsAdmin(false);
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
          }
        });
        return () => unsubscribeData();
      }
    });
    return () => unsubscribeAuth();
  }, [pendingUpdates.size]);

  useEffect(() => {
    attendanceDataRef.current = attendanceData;
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
  }, [attendanceData]);

  const saveAttendanceDataToFirebase = async (newData) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try { await setDoc(userDocRef, { attendanceData: newData }, { merge: true }); } catch (e) { console.error(e); }
  };

  const queueAttendanceSave = () => {
    if (attendanceSaveTimer.current) clearTimeout(attendanceSaveTimer.current);
    attendanceSaveTimer.current = setTimeout(() => {
      saveAttendanceDataToFirebase(attendanceDataRef.current);
    }, 1500);
  };

  const updateAttendanceData = (index, field, value) => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      if (!updated[index]) updated[index] = { attended: '', total: '', requiredPerc: 75, dailyStatus: {} };
      updated[index][field] = value;
      return updated;
    });
    queueAttendanceSave();
  };

  const saveSubjectAttendance = async (subjectIndex, newSubjectData) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try { await updateDoc(userDocRef, { [`attendanceData.${subjectIndex}`]: newSubjectData }); } catch (e) { console.error(e); }
  };

  const saveLastPunch = async (metadata) => {
      setLastPunch(metadata);
      if (!currentUser) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      try { await updateDoc(userDocRef, { lastPunch: metadata }); } catch (e) { console.error(e); }
  };

  const punchIn = (subjectIndex, period, status) => {
    const updateKey = `punch-${subjectIndex}-${period}`;
    if (pendingUpdates.has(updateKey)) return;
    setPendingUpdates(prev => new Set(prev).add(updateKey));

    const todayDate = new Date().toISOString().slice(0, 10);
    const oldData = attendanceData[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
    let attended = Number(oldData.attended) || 0;
    let total = Number(oldData.total) || 0;
    const dailyStatus = JSON.parse(JSON.stringify(oldData.dailyStatus || {}));
    const day = dailyStatus[todayDate] ? { ...dailyStatus[todayDate] } : {};

    if (day[period]) {
      setPendingUpdates(prev => { const n = new Set(prev); n.delete(updateKey); return n; });
      return;
    }

    day[period] = status;
    dailyStatus[todayDate] = day;
    if (status === 'attended') { attended++; total++; }
    else if (status === 'bunked') { total++; }

    const updatedSubjectData = { ...oldData, attended, total, dailyStatus };
    setAttendanceData(prev => ({ ...prev, [subjectIndex]: updatedSubjectData }));

    const now = new Date();
    saveLastPunch({
        subjectName: subjects[subjectIndex] || "Unknown",
        period,
        status,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
    });

    saveSubjectAttendance(subjectIndex, updatedSubjectData).finally(() => {
      setPendingUpdates(prev => { const n = new Set(prev); n.delete(updateKey); return n; });
    });
  };

  const undoPunchIn = (subjectIndex, period) => {
    const updateKey = `undo-${subjectIndex}-${period}`;
    if (pendingUpdates.has(updateKey)) return;
    setPendingUpdates(prev => new Set(prev).add(updateKey));

    const todayDate = new Date().toISOString().slice(0, 10);
    const oldData = attendanceData[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
    let attended = Number(oldData.attended) || 0;
    let total = Number(oldData.total) || 0;
    const dailyStatus = JSON.parse(JSON.stringify(oldData.dailyStatus || {}));
    const day = dailyStatus[todayDate] ? { ...dailyStatus[todayDate] } : {};

    if (!day[period]) {
      setPendingUpdates(prev => { const n = new Set(prev); n.delete(updateKey); return n; });
      return;
    }

    const lastStatus = day[period];
    delete day[period];
    if (Object.keys(day).length === 0) delete dailyStatus[todayDate];
    else dailyStatus[todayDate] = day;

    if (lastStatus === 'attended' && attended > 0 && total > 0) { attended--; total--; }
    else if (lastStatus === 'bunked' && total > 0) { total--; }

    const updatedSubjectData = { ...oldData, attended, total, dailyStatus };
    setAttendanceData(prev => ({ ...prev, [subjectIndex]: updatedSubjectData }));
    
    saveSubjectAttendance(subjectIndex, updatedSubjectData).finally(() => {
      setPendingUpdates(prev => { const n = new Set(prev); n.delete(updateKey); return n; });
    });
  };

  const checkForMissedAttendance = (customStartDate, customEndDate) => {
    if (!timetable || Object.keys(timetable).length === 0) return "No timetable found.";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = new Date(today);
    let end = new Date(today);
    
    if (customStartDate && customEndDate) {
        start = new Date(customStartDate);
        end = new Date(customEndDate);
    } else {
        // Default: Check only last 7 days
        start.setDate(today.getDate() - 7);
        end.setDate(today.getDate() - 1); 
    }

    const missedSessions = [];
    const daysChecked = [];

    for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
        const checkDate = new Date(d);
        const dateStr = checkDate.toISOString().slice(0, 10);
        const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        const daySchedule = timetable[dayName];
        if (daySchedule && Object.keys(daySchedule).length > 0) {
            let hasDataForDate = false;
            Object.values(attendanceData).forEach(subData => {
                if (subData.dailyStatus && subData.dailyStatus[dateStr]) hasDataForDate = true;
            });

            if (!hasDataForDate) {
                daysChecked.push(new Date(checkDate));
                Object.entries(daySchedule).forEach(([period, subjectIndex]) => {
                    if (subjects[subjectIndex]) {
                        missedSessions.push({
                            date: dateStr,
                            displayDate: checkDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }),
                            dayName: dayName,
                            period: period,
                            subjectIndex: subjectIndex,
                            subjectName: subjects[subjectIndex]
                        });
                    }
                });
            }
        }
    }

    // Always open modal to allow date picking, even if 0 days missed initially
    const endDateStr = daysChecked.length > 0 ? daysChecked[0].toLocaleDateString(undefined, {month:'short', day:'numeric'}) : end.toLocaleDateString(undefined, {month:'short', day:'numeric'});
    const startDateStr = daysChecked.length > 0 ? daysChecked[daysChecked.length - 1].toLocaleDateString(undefined, {month:'short', day:'numeric'}) : start.toLocaleDateString(undefined, {month:'short', day:'numeric'});
    
    setMissedAttendance({
        daysMissed: daysChecked.length,
        dateRange: `${startDateStr} to ${endDateStr}`,
        sessions: missedSessions
    });
    setActiveModal('missedAttendance');
    return `Checked.`;
  };

  const batchPunchIn = (sessionsToUpdate) => {
    const newData = JSON.parse(JSON.stringify(attendanceData));
    sessionsToUpdate.forEach(session => {
        const { date, period, subjectIndex, status } = session;
        if (!newData[subjectIndex]) newData[subjectIndex] = { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
        const subData = newData[subjectIndex];
        if (!subData.dailyStatus) subData.dailyStatus = {};
        if (!subData.dailyStatus[date]) subData.dailyStatus[date] = {};
        
        if (!subData.dailyStatus[date][period]) {
            subData.dailyStatus[date][period] = status;
            subData.total = (Number(subData.total) || 0) + 1;
            if (status === 'attended') subData.attended = (Number(subData.attended) || 0) + 1;
        }
    });
    setAttendanceData(newData);
    saveData({ attendanceData: newData });
    
    if (sessionsToUpdate.length > 0) {
         const now = new Date();
         saveLastPunch({
            subjectName: "Batch Update",
            period: "-",
            status: "Multiple",
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
         });
    }

    setMissedAttendance(null);
    setActiveModal(null);
  };

  const value = {
    currentUser, subjects, attendanceData, timetable, profile, isLoading, selectedSubjects, setSelectedSubjects,
    setSubjects, setTimetable, handleSelectSubject: (i) => setSelectedSubjects(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]),
    updateAttendanceData, saveData, saveSubjects, punchIn, undoPunchIn, logout: () => signOut(auth),
    getProfileStats: () => {
      let tA = 0, tC = 0;
      Object.values(attendanceData).forEach(d => { tA += Number(d.attended) || 0; tC += Number(d.total) || 0; });
      const overall = tC > 0 ? (tA / tC) * 100 : NaN;
      return { totalSubjects: subjects.length, overallAttendance: isNaN(overall) ? '--' : overall.toFixed(2) };
    },
    activeModal, setActiveModal, closeModal: () => setActiveModal(null), isAdmin,
    checkForMissedAttendance, missedAttendance, batchPunchIn, lastPunch
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};