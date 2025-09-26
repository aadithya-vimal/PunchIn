import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { db } from '../firebase/config';
import { doc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';

const NotesEditor = ({ onClose }) => {
  const { currentUser } = useContext(UserContext);
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [status, setStatus] = useState('');

  // Get Firestore doc ref for current user only
  const getDocRef = () => {
    if (currentUser) {
      return doc(db, 'users', currentUser.uid);
    }
    return null;
  } 

  // Real-time sync: only for current user
  useEffect(() => {
    const docRef = getDocRef();
    if (!docRef) return;
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const notes = data.notesContent;
        if (notes !== content) {
          setContent(notes || '');
        }
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, [currentUser]);

  // Save notes to Firestore
  const handleSave = async () => {
    const docRef = getDocRef();
    if (!docRef) return;
    setStatus('Saving...');
    await updateDoc(docRef, { notesContent: content });
    setStatus('Saved!');
    setTimeout(() => setStatus(''), 1500);
  };

  // Export notes as Markdown file
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, 'notes.md');
  };





  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-4xl flex flex-col h-[80vh] text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Notes Editor</h2>
          <div className="flex gap-2">
            <button onClick={() => setPreviewMode(!previewMode)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button onClick={handleExport} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Export</button>
            {/* Only the Close Notes button remains */}
            <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Close Notes</button>
          </div>
        </div>
        <div className="flex-grow flex flex-col">
          {previewMode ? (
            <div className="bg-gray-800 rounded-lg p-4 overflow-auto h-full text-white prose prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="flex-grow w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-lg resize-none text-white"
              style={{ minHeight: '300px' }}
              placeholder={"Personal notes (Markdown supported)..."}
            />
          )}
        </div>
        <div className="flex justify-between items-center gap-3 mt-4">
          <span className="text-green-400 font-semibold">{status}</span>
          <button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Save</button>
        </div>
      </div>
    </div>
  );
};

export default NotesEditor;
