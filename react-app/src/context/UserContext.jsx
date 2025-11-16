import React, { createContext, useState, useEffect, useRef } from 'react'; // Added useRef
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { saveToIndexedDB, getFromIndexedDB } from '../utils/indexedDB';

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
  
  // --- FIX: Debounce timer for attendance input fields ---
  const attendanceSaveTimer = useRef(null);
  // ---

  // Function definitions
  const validateData = (data) => {
    if ('subjects' in data && (!Array.isArray(data.subjects) || data.subjects.some(s => typeof s !== 'string' || !s.trim()))) {
      alert('Invalid subjects data. Each subject must be a non-empty string.');
      return false;
    }
    if ('attendanceData' in data && typeof data.attendanceData !== 'object') {
      alert('Invalid attendance data.');
      return false;
    }
    if ('timetable' in data && typeof data.timetable !== 'object') {
      alert('Invalid timetable data.');
      return false;
    }
    if ('profile' in data && typeof data.profile !== 'object') {
      alert('Invalid profile data.');
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
      await updateDoc(userDocRef, dataToSave);
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
        // --- SECURITY FIX: CLIENT-SIDE ADMIN CHECK REMOVED ---
        // This is insecure. Admin status must be set via a secure backend
        // (e.g., Firebase Custom Claims) and read from the user token.
        // We set it to false and leave the 'isAdmin' prop for UI compatibility.
        // if (user.email === 'aadithyavimal06@gmail.com') { // <-- REMOVED
        //   setIsAdmin(true);
        // } else {
        //   setIsAdmin(false);
        // }
        // TODO: Replace this with a secure check
        setIsAdmin(false); 
        // --- END SECURITY FIX ---

        // Load all user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeData = onSnapshot(userDocRef, (docSnap) => {
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
  }, []);

  // ...existing code...

  useEffect(() => {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
  }, [attendanceData]);

  // --- PERFORMANCE FIX: Centralized save function ---
  const saveAttendanceDataToFirebase = (newData) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    // Save the entire attendanceData object
    updateDoc(userDocRef, { attendanceData: newData })
      .catch(e => console.error("Error saving attendanceData:", e));
  };
  
  // --- PERFORMANCE FIX: Debouncer function ---
  const queueAttendanceSave = (newData) => {
    // Clear existing timer
    if (attendanceSaveTimer.current) {
      clearTimeout(attendanceSaveTimer.current);
    }
    // Set new timer to save after 1.5 seconds
    attendanceSaveTimer.current = setTimeout(() => {
      saveAttendanceDataToFirebase(newData);
    }, 1500);
  };

  const updateAttendanceData = (index, field, value) => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      if (!updated[index]) {
        updated[index] = { attended: '', total: '', requiredPerc: 75, dailyStatus: {} };
      }
      updated[index][field] = value;

      // --- PERFORMANCE FIX ---
      // Don't save immediately. Queue the save.
      queueAttendanceSave(updated);
      // ---
      
      return updated;
    });
  };


  const punchIn = (subjectIndex, period, status) => {
    setAttendanceData(prev => {
      const todayDate = new Date().toISOString().slice(0, 10);
      const updated = { ...prev };
      const oldData = prev[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
      let attended = Number(oldData.attended) || 0;
      let total = Number(oldData.total) || 0;
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
      
      // --- PERFORMANCE FIX ---
      // Save immediately, but use the centralized function
      saveAttendanceDataToFirebase(updated);
      // ---
      
      return updated;
    });
  };

  const undoPunchIn = (subjectIndex, period) => {
    setAttendanceData(prev => {
      const todayDate = new Date().toISOString().slice(0, 10);
      const updated = { ...prev };
      const oldData = prev[subjectIndex] || { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
      let attended = Number(oldData.attended) || 0;
      let total = Number(oldData.total) || 0;
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

      // --- PERFORMANCE FIX ---
      // Save immediately, but use the centralized function
      saveAttendanceDataToFirebase(updated);
      // ---
      
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