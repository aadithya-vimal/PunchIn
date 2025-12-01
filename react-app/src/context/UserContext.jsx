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

  // --- FIX Bug #16: Race Condition Tracking ---
  // Track pending updates to prevent double-taps and listener overwrites
  const [pendingUpdates, setPendingUpdates] = useState(new Set());
  // ---

  // --- FIX: Debounce timer for attendance input fields ---
  const attendanceSaveTimer = useRef(null);
  const attendanceDataRef = useRef(attendanceData); // Track latest data for debouncer
  // ---

  // Function definitions
  const validateData = (data) => {
    // Bug #11 Fix: Replace alerts with console warnings
    if ('subjects' in data && (!Array.isArray(data.subjects) || data.subjects.some(s => typeof s !== 'string' || !s.trim()))) {
      console.warn('Invalid subjects data. Each subject must be a non-empty string.');
      return false;
    }
    if ('attendanceData' in data && typeof data.attendanceData !== 'object') {
      console.warn('Invalid attendance data.');
      return false;
    }
    if ('timetable' in data && typeof data.timetable !== 'object') {
      console.warn('Invalid timetable data.');
      return false;
    }
    if ('profile' in data && typeof data.profile !== 'object') {
      console.warn('Invalid profile data.');
      return false;
    }
    return true;
  };

  const saveData = async (dataToSave, options = {}) => {
    if (!currentUser) return;
    if (options.confirmDestructive) {
      const isDestructive = Object.keys(dataToSave).some(key => key === 'subjects' || key === 'attendanceData' || key === 'timetable');
      if (isDestructive) {
        const confirmed = window.confirm('This action will overwrite your subjects, attendance, or timetable. Are you sure you want to proceed?');
        if (!confirmed) return;
      }
    }
    if (!validateData(dataToSave)) return;

    // --- FIX 2: Optimistic UI Update ---
    // Update local React state immediately so the UI doesn't lag.
    if ('subjects' in dataToSave) {
      setSubjects(dataToSave.subjects);
    }
    if ('attendanceData' in dataToSave) {
      setAttendanceData(dataToSave.attendanceData);
    }
    if ('timetable' in dataToSave) {
      setTimetable(dataToSave.timetable);
    }
    if ('profile' in dataToSave) {
      setProfile(dataToSave.profile);
    }
    // --- END FIX 2 ---

    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      // Now, save the same data to Firebase
      await setDoc(userDocRef, dataToSave, { merge: true });
    } catch (e) {
      console.error("Error saving data:", e);
      // In a production app, we might "roll back" the optimistic state update here
    }
  };

  // --- FIX 3: New function to handle subject saving and data re-indexing ---
  const saveSubjects = (newSubjectNames) => {
    // 1. Create a map of old subject names to their attendance data
    const oldDataMap = new Map();
    subjects.forEach((oldSubject, oldIndex) => {
      oldDataMap.set(oldSubject, attendanceData[oldIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} });
    });

    // 2. Build new attendanceData based on the new subject order
    const newAttendanceData = {};
    newSubjectNames.forEach((newSubject, newIndex) => {
      // Get old data if it exists, or create new default data
      newAttendanceData[newIndex] = oldDataMap.get(newSubject) || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
    });

    // 3. Build new timetable, re-indexing subject IDs
    const newTimetable = {};
    Object.entries(timetable).forEach(([day, periods]) => {
      newTimetable[day] = {};
      Object.entries(periods).forEach(([period, subjectIndex]) => {
        const oldSubjectName = subjects[subjectIndex]; // Get the name from the old index
        const newIndex = newSubjectNames.indexOf(oldSubjectName); // Find the new index
        if (newIndex !== -1) {
          // If the subject still exists, save its new index
          newTimetable[day][period] = newIndex;
        }
        // If newIndex is -1 (subject was deleted), it's automatically removed
      });
    });

    // 4. Reset selected subjects array as indices are now invalid
    setSelectedSubjects([]);

    // 5. Call saveData to update state and save all 3 data structures to Firebase
    saveData({
      subjects: newSubjectNames,
      attendanceData: newAttendanceData,
      timetable: newTimetable
    });
  };
  // --- END FIX 3 ---

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      if (!user) {
        setSubjects([]);
        setAttendanceData({});
        setTimetable({});
        setProfile({});
        setSelectedSubjects([]);
        setIsAdmin(false);
        localStorage.removeItem('attendanceData');
      } else {
        // Bug #7 Fix: Cleaned up admin check
        // Admin status must be set via a secure backend (e.g., Firebase Custom Claims)
        setIsAdmin(false);

        // Load all user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeData = onSnapshot(userDocRef, (docSnap) => {
          // Bug #16 Fix: Don't overwrite local state if there are pending updates
          if (pendingUpdates.size > 0) {
            return;
          }

          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubjects(data.subjects || []);
            setAttendanceData(data.attendanceData || {});
            setTimetable(data.timetable || {});
            setProfile(data.profile || {});
          }
        }, (error) => {
          console.error('Error loading user data:', error);
        });
        // Clean up Firestore listener on logout
        return () => unsubscribeData();
      }
    });
    return () => unsubscribeAuth();
  }, [pendingUpdates.size]); // Re-run listener logic when pending updates clear

  useEffect(() => {
    attendanceDataRef.current = attendanceData; // Keep ref in sync
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
  }, [attendanceData]);

  // --- PERFORMANCE FIX: Centralized save function ---
  const saveAttendanceDataToFirebase = async (newData) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    // Save the entire attendanceData object
    try {
      await setDoc(userDocRef, { attendanceData: newData }, { merge: true });
    } catch (e) {
      console.error("Error saving attendanceData:", e);
    }
  };

  // --- PERFORMANCE FIX: Debouncer function ---
  const queueAttendanceSave = () => {
    // Clear existing timer
    if (attendanceSaveTimer.current) {
      clearTimeout(attendanceSaveTimer.current);
    }
    // Set new timer to save after 1.5 seconds
    attendanceSaveTimer.current = setTimeout(() => {
      // Always save the LATEST data from the ref
      saveAttendanceDataToFirebase(attendanceDataRef.current);
    }, 1500);
  };

  const updateAttendanceData = (index, field, value) => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      if (!updated[index]) {
        updated[index] = { attended: '', total: '', requiredPerc: 75, dailyStatus: {} };
      }
      updated[index][field] = value;
      return updated;
    });
    // --- PERFORMANCE FIX ---
    // Don't save immediately. Queue the save.
    queueAttendanceSave();
    // ---
  };

  // --- FIX: Granular Update Helper ---
  const saveSubjectAttendance = async (subjectIndex, newSubjectData) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      // Update ONLY the specific subject's index in the map
      await updateDoc(userDocRef, {
        [`attendanceData.${subjectIndex}`]: newSubjectData
      });
    } catch (e) {
      console.error("Error saving subject attendance:", e);
    }
  };
  // ---

  const punchIn = (subjectIndex, period, status) => {
    // Bug #16 Fix: Deduplication
    const updateKey = `punch-${subjectIndex}-${period}`;
    if (pendingUpdates.has(updateKey)) return;

    // Add to pending updates
    setPendingUpdates(prev => new Set(prev).add(updateKey));

    const todayDate = new Date().toISOString().slice(0, 10);
    const oldData = attendanceData[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
    let attended = Number(oldData.attended) || 0;
    let total = Number(oldData.total) || 0;
    const dailyStatus = JSON.parse(JSON.stringify(oldData.dailyStatus || {}));
    const day = dailyStatus[todayDate] ? { ...dailyStatus[todayDate] } : {};

    if (day[period]) {
      // Already punched (maybe via another device, or race).
      // But pendingUpdates check passed.
      // If local state says punched, we stop.
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(updateKey);
        return next;
      });
      return;
    }

    day[period] = status;
    dailyStatus[todayDate] = day;
    if (status === 'attended') {
      attended += 1;
      total += 1;
    } else if (status === 'bunked') {
      total += 1;
    }

    const updatedSubjectData = {
      ...oldData,
      attended,
      total,
      dailyStatus
    };

    // 1. Update Local State
    setAttendanceData(prev => ({
      ...prev,
      [subjectIndex]: updatedSubjectData
    }));

    // 2. Save to Firestore
    saveSubjectAttendance(subjectIndex, updatedSubjectData).finally(() => {
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(updateKey);
        return next;
      });
    });
  };

  const undoPunchIn = (subjectIndex, period) => {
    // Bug #16 Fix: Deduplication
    const updateKey = `undo-${subjectIndex}-${period}`;
    if (pendingUpdates.has(updateKey)) return;

    // Add to pending updates
    setPendingUpdates(prev => new Set(prev).add(updateKey));

    const todayDate = new Date().toISOString().slice(0, 10);
    const oldData = attendanceData[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
    let attended = Number(oldData.attended) || 0;
    let total = Number(oldData.total) || 0;
    const dailyStatus = JSON.parse(JSON.stringify(oldData.dailyStatus || {}));
    const day = dailyStatus[todayDate] ? { ...dailyStatus[todayDate] } : {};

    if (!day[period]) {
      // Nothing to undo
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(updateKey);
        return next;
      });
      return;
    }

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

    const updatedSubjectData = {
      ...oldData,
      attended,
      total,
      dailyStatus
    };

    // 1. Update Local State
    setAttendanceData(prev => ({
      ...prev,
      [subjectIndex]: updatedSubjectData
    }));

    // 2. Save to Firestore
    saveSubjectAttendance(subjectIndex, updatedSubjectData).finally(() => {
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(updateKey);
        return next;
      });
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
    saveSubjects, // <-- Exporting the new function
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
    isAdmin, // <-- Exporting isAdmin
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};