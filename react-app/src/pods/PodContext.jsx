import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, onSnapshot, collection, query, where, addDoc } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';

export const PodContext = createContext();

export const PodProvider = ({ children }) => {
  const { currentUser } = useContext(UserContext);
  const [pods, setPods] = useState([]);
  const [activePod, setActivePod] = useState(null);
  const [podMembers, setPodMembers] = useState([]); // Array of { uid, displayName }
  const [podData, setPodData] = useState({});
  const memberCache = React.useRef({}); // Cache for member profiles

  // Fetch pods for current user
  useEffect(() => {
    if (!currentUser) return;
    const podsRef = collection(db, 'pods');
    const q = query(podsRef, where('members', 'array-contains', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const podList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPods(podList);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Fetch pod members and data for active pod
  useEffect(() => {
    if (!activePod) return;
    const podDocRef = doc(db, 'pods', activePod);
    const unsubscribe = onSnapshot(podDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        setPodData(docSnap.data());
        const memberUids = docSnap.data().members || [];

        // Identify missing members
        const missingUids = memberUids.filter(uid => !memberCache.current[uid]);

        if (missingUids.length > 0) {
          const newMemberInfos = await Promise.all(missingUids.map(async (uid) => {
            const userDocRef = doc(db, 'users', String(uid));
            try {
              const userSnap = await getDoc(userDocRef);
              let displayName = uid;
              if (userSnap.exists()) {
                const profile = userSnap.data().profile;
                displayName = profile && typeof profile.displayName === 'string' ? profile.displayName : String(uid);
              }
              return { uid: String(uid), displayName: String(displayName) };
            } catch (e) {
              console.warn(`Failed to fetch profile for ${uid}`, e);
              return { uid: String(uid), displayName: String(uid) };
            }
          }));

          // Update cache
          newMemberInfos.forEach(info => {
            memberCache.current[info.uid] = info;
          });
        }

        // Construct podMembers from cache
        const currentMembers = memberUids.map(uid => memberCache.current[uid] || { uid: String(uid), displayName: String(uid) });
        setPodMembers(currentMembers);
      }
    });
    return () => unsubscribe();
  }, [activePod]);
  // Leave pod (remove self from pod members)
  const leavePod = async () => {
    if (!currentUser || !activePod) return;
    const podDocRef = doc(db, 'pods', activePod);
    const podSnap = await getDoc(podDocRef);
    if (!podSnap.exists()) return;
    const members = podSnap.data().members || [];
    const updatedMembers = members.filter(uid => uid !== currentUser.uid);
    await updateDoc(podDocRef, { members: updatedMembers });
    setActivePod(null);
  };
  // Get display name for a member UID
  const getMemberDisplayName = (uid) => {
    const member = podMembers.find(m => m.uid === uid);
    return member ? member.displayName : uid;
  };

  // Create a new pod
  const createPod = async (name) => {
    if (!currentUser) return;
    const podsRef = collection(db, 'pods');
    const podDoc = await addDoc(podsRef, {
      name,
      members: [currentUser.uid],
      createdAt: Date.now(),
    });
    setActivePod(podDoc.id);
  };

  // Join an existing pod
  const joinPod = async (podId) => {
    if (!currentUser) return;
    const podDocRef = doc(db, 'pods', podId);
    await updateDoc(podDocRef, {
      members: arrayUnion(currentUser.uid)
    });
    setActivePod(podId);
  };

  // Copy subjects/timetable from another member (attendance reset handled in UI logic)
  const getMemberData = async (memberUid) => {
    const userDocRef = doc(db, 'users', memberUid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return null;
    const { subjects, timetable } = userSnap.data();
    return { subjects, timetable };
  };

  const value = {
    pods,
    activePod,
    setActivePod,
    podMembers,
    podData,
    createPod,
    joinPod,
    getMemberData,
    leavePod,
    getMemberDisplayName,
  };

  return <PodContext.Provider value={value}>{children}</PodContext.Provider>;
};
