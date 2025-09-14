import React, { createContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      if (!user) {
        setSubjects([]);
        setAttendanceData({});
        setTimetable({});
        setProfile({});
        setSelectedSubjects([]);
        localStorage.removeItem('attendanceData');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSubjects(data.subjects || []);
          setAttendanceData(data.attendanceData || {});
          setTimetable(data.timetable || {});
          setProfile(data.profile || {});
          localStorage.setItem('attendanceData', JSON.stringify(data.attendanceData || {}));
        } else {
          const defaultData = {
            subjects: [],
            attendanceData: {},
            timetable: {},
            profile: { displayName: currentUser.displayName || currentUser.email }
          };
          setDoc(userDocRef, defaultData).catch(console.error);
          localStorage.setItem('attendanceData', JSON.stringify({}));
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
  }, [attendanceData]);

  const updateAttendanceData = (index, field, value) => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      if (!updated[index]) {
        updated[index] = { attended: '', total: '', requiredPerc: 75, dailyStatus: {} };
      }
      updated[index][field] = value;

      // Persist change to Firestore immediately
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        updateDoc(userDocRef, { [`attendanceData.${index}`]: updated[index] })
          .catch(e => console.error("Error saving attendanceData:", e));
      }
      return updated;
    });
  };

  const saveData = async (dataToSave) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, dataToSave);
    } catch (e) {
      console.error("Error saving data:", e);
    }
  };

  const punchIn = (subjectIndex, period, status) => {
    setAttendanceData(prev => {
      const todayDate = new Date().toISOString().slice(0, 10);
      const updated = { ...prev };
      const oldData = prev[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
      let attended = oldData.attended || 0;
      let total = oldData.total || 0;
      // Deep clone dailyStatus
      const dailyStatus = JSON.parse(JSON.stringify(oldData.dailyStatus || {}));
      const day = dailyStatus[todayDate] ? { ...dailyStatus[todayDate] } : {};

      // Only update if not already set for this period
      if (!day[period]) {
        day[period] = status;
        dailyStatus[todayDate] = day;
        if (status === 'attended') {
          attended += 1;
          total += 1;
        } else if (status === 'bunked') {
          total += 1;
        }
      }

      updated[subjectIndex] = {
        ...oldData,
        attended,
        total,
        dailyStatus
      };
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        updateDoc(userDocRef, { [`attendanceData.${subjectIndex}`]: updated[subjectIndex] })
          .catch(e => console.error("Error saving attendanceData:", e));
      }
      return updated;
    });
  };

  const undoPunchIn = (subjectIndex, period) => {
    setAttendanceData(prev => {
      const todayDate = new Date().toISOString().slice(0, 10);
      const updated = { ...prev };
      const oldData = prev[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
      let attended = oldData.attended || 0;
      let total = oldData.total || 0;
      // Deep clone dailyStatus
      const dailyStatus = JSON.parse(JSON.stringify(oldData.dailyStatus || {}));
      const day = dailyStatus[todayDate] ? { ...dailyStatus[todayDate] } : {};

      // Only undo if set for this period
      if (day[period]) {
        const lastStatus = day[period];
        delete day[period];
        if (Object.keys(day).length === 0) {
          delete dailyStatus[todayDate];
        } else {
          dailyStatus[todayDate] = day;
        }
        if (lastStatus === 'attended' && attended > 0 && total > 0) {
          attended -= 1;
          total -= 1;
        } else if (lastStatus === 'bunked' && total > 0) {
          total -= 1;
        }
      }

      updated[subjectIndex] = {
        ...oldData,
        attended,
        total,
        dailyStatus
      };
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        updateDoc(userDocRef, { [`attendanceData.${subjectIndex}`]: updated[subjectIndex] })
          .catch(e => console.error("Error saving attendanceData:", e));
      }
      return updated;
    });
  };

  const value = {
    currentUser,
    subjects,
    attendanceData,
    timetable,
    profile,
    isLoading,
    selectedSubjects,
    setSelectedSubjects,
    setSubjects,
    setTimetable,
    handleSelectSubject: (index) => {
      setSelectedSubjects(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]));
    },
    updateAttendanceData,
    saveData,
    punchIn,
    undoPunchIn,
    logout: () => signOut(auth),
    getProfileStats: () => {
      let totalAttended = 0;
      let totalClasses = 0;
      Object.values(attendanceData).forEach(data => {
        totalAttended += Number(data.attended) || 0;
        totalClasses += Number(data.total) || 0;
      });
      const overallAttendance = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : NaN;
      return { totalSubjects: subjects.length, overallAttendance: isNaN(overallAttendance) ? '--' : overallAttendance.toFixed(2) };
    },
    activeModal,
    setActiveModal,
    closeModal: () => setActiveModal(null),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
