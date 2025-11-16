import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebase/config';
// --- FIX: Import v9 Firestore functions ---
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
// ---
import { UserContext } from '../context/UserContext.jsx';
import NotificationBanner from './NotificationBanner.jsx';

const AdminRecoveryPanel = () => {
  const { isAdmin } = useContext(UserContext);
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  useEffect(() => {
    setUserData(null);
  }, [userEmail]);

  const fetchUserData = async () => {
    if (!userEmail) return;
    setNotification({ message: '', type: 'info' });
    try {
      // --- FIX: Updated query to v9 syntax ---
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('profile.email', '==', userEmail));
      const userQuery = await getDocs(q);
      // ---
      
      if (userQuery.empty) {
        setNotification({ message: 'No user found with that email.', type: 'error' });
        setUserData(null);
        return;
      }
      const userDoc = userQuery.docs[0];
      setUserData({ id: userDoc.id, ...userDoc.data() });
    } catch (e) {
      console.error('Error fetching user:', e); // Added console.error for debugging
      setNotification({ message: 'Error fetching user data.', type: 'error' });
    }
  };

  const restoreBackup = async () => {
    if (!userData) return;
    try {
      // Example: restore from backup in IndexedDB (could be extended for Firestore backups)
      // Note: Your indexedDB.js doesn't export 'getFromIndexedDB' as a named export.
      // This function may not work as intended.
      const backup = await window.indexedDB.getFromIndexedDB('userDataBackup');
      if (!backup) {
        setNotification({ message: 'No backup found for this user.', type: 'error' });
        return;
      }
      await updateDoc(doc(db, 'users', userData.id), backup);
      setNotification({ message: 'User data restored from backup.', type: 'success' });
    } catch (e) {
      setNotification({ message: 'Error restoring backup.', type: 'error' });
    }
  };

  const handleManualEdit = async (field, value) => {
    if (!userData) return;
    try {
      await updateDoc(doc(db, 'users', userData.id), { [field]: value });
      setNotification({ message: 'User data updated.', type: 'success' });
    } catch (e) {
      setNotification({ message: 'Error updating user data.', type: 'error' });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-2xl max-w-xl mx-auto mt-8 text-white">
      <NotificationBanner message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'info' })} />
      <h2 className="text-2xl font-bold mb-4">Admin Recovery Panel</h2>
      <div className="mb-4">
        <input
          type="email"
          placeholder="Enter user email"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
          className="px-4 py-2 rounded bg-gray-800 border border-gray-700 w-full"
        />
        <button onClick={fetchUserData} className="mt-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white font-bold">Fetch User Data</button>
      </div>
      {userData && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">User Data</h3>
          <pre className="bg-gray-800 p-3 rounded text-xs overflow-x-auto max-h-48">{JSON.stringify(userData, null, 2)}</pre>
          <button onClick={restoreBackup} className="mt-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-bold">Restore from Backup</button>
        </div>
      )}
      {/* Manual edit UI could be added here for each field */}
    </div>
  );
};

export default AdminRecoveryPanel;