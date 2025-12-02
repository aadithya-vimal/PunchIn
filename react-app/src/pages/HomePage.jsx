import NotesEditor from '../components/NotesEditor.jsx';
import NotificationBanner from '../components/NotificationBanner.jsx';
import AdminRecoveryPanel from '../components/AdminRecoveryPanel.jsx';
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext.jsx';
import SubjectList from '../components/SubjectList.jsx';
import DueCalendar from '../components/DueCalendar.jsx';
import CalculatorPanel from '../components/CalculatorPanel.jsx';
import DailyDashboard from '../components/DailyDashboard.jsx';
import AttendanceOverview from '../components/AttendanceOverview.jsx';
import ProfileModal from '../components/ProfileModal.jsx';
import EditSubjectsModal from '../components/EditSubjectsModal.jsx';
import TimetableModal from '../components/TimetableModal.jsx';
import TimetableGlance from '../components/TimetableGlance.jsx';
import AIAssistant from '../components/AIAssistant.jsx';
import AskAI from '../components/AskAI.jsx'; 
import LastPunchWidget from '../components/LastPunchWidget.jsx'; 
import DateTime from '../components/DateTime.jsx';
import PodManager from '../pods/PodManager.jsx';
import PodMemberList from '../pods/PodMemberList.jsx';
import PodCopyFeature from '../pods/PodCopyFeature.jsx';
import { PodProvider } from '../pods/PodContext.jsx';
import PodBadgesLeaderboard from '../pods/PodBadgesLeaderboard.jsx';
import { PodGroupAIProvider, PodGroupAIContext } from '../pods/PodGroupAIContext.jsx';
import PodBunkPlanner from '../pods/PodBunkPlanner.jsx';
import MissedAttendanceModal from '../components/MissedAttendanceModal.jsx'; 
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

function PodBunkPlannerWithContext() {
    const { getGroupBunkRecommendation } = React.useContext(PodGroupAIContext);
    return <PodBunkPlanner getGroupBunkRecommendation={getGroupBunkRecommendation} />;
}

function PodCopyConnector() {
    const [copyUid, setCopyUid] = useState(null);
    const [copyData, setCopyData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <>
            <PodMemberList
                onSelectMember={() => { }}
                onCopyMemberData={(uid, data) => {
                    setCopyUid(uid);
                    setCopyData(data);
                    setModalOpen(true);
                }}
            />
            <PodCopyFeature
                selectedUid={copyUid}
                memberData={copyData}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
        </>
    );
}

const HomePage = () => {
    const { currentUser, profile, logout, activeModal, setActiveModal, isAdmin, checkForMissedAttendance } = useContext(UserContext);

    const [podsOpen, setPodsOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [podsHelpOpen, setPodsHelpOpen] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'info' });

    const [notebooks, setNotebooks] = useState([]);
    const [newNotebookName, setNewNotebookName] = useState('');
    const [noteInputs, setNoteInputs] = useState({});
    const [editingNote, setEditingNote] = useState({ notebookId: null, noteIdx: null });
    const [editNoteValue, setEditNoteValue] = useState('');
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentUser) {
                checkForMissedAttendance();
            }
        }, 2000); 
        return () => clearTimeout(timer);
    }, [currentUser]);

    const showNotification = (message, type = 'info', duration = 4000) => {
        setNotification({ message, type });
        if (duration > 0) {
            setTimeout(() => setNotification({ message: '', type: 'info' }), duration);
        }
    };

    useEffect(() => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setNotebooks(data.notebooks || []);
            }
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleCreateNotebook = (e) => {
        e.preventDefault();
        if (!newNotebookName.trim()) return;
        const updated = [...notebooks, { id: Date.now(), name: newNotebookName.trim(), notes: [] }];
        setNotebooks(updated);
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            setDoc(userDocRef, { notebooks: updated }, { merge: true });
        }
        setNewNotebookName("");
    };
    const handleDeleteNotebook = (id) => {
        const updated = notebooks.filter(nb => nb.id !== id);
        setNotebooks(updated);
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            setDoc(userDocRef, { notebooks: updated }, { merge: true });
        }
        setNoteInputs(inputs => {
            const copy = { ...inputs };
            delete copy[id];
            return copy;
        });
    };
    const handleAddNote = (e, notebookId) => {
        e.preventDefault();
        const note = noteInputs[notebookId]?.trim();
        if (!note) return;
        const updated = notebooks.map(nb => nb.id === notebookId ? { ...nb, notes: [...nb.notes, note] } : nb);
        setNotebooks(updated);
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            setDoc(userDocRef, { notebooks: updated }, { merge: true });
        }
        setNoteInputs(inputs => ({ ...inputs, [notebookId]: "" }));
    };
    const handleDeleteNote = (notebookId, noteIdx) => {
        const updated = notebooks.map(nb => nb.id === notebookId ? { ...nb, notes: nb.notes.filter((_, idx) => idx !== noteIdx) } : nb);
        setNotebooks(updated);
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            setDoc(userDocRef, { notebooks: updated }, { merge: true });
        }
    };
    const handleEditNote = (notebookId, noteIdx, value) => {
        const updated = notebooks.map(nb => nb.id === notebookId ? {
            ...nb,
            notes: nb.notes.map((note, idx) => idx === noteIdx ? value : note)
        } : nb);
        setNotebooks(updated);
        setEditingNote({ notebookId: null, noteIdx: null });
        setEditNoteValue("");
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            setDoc(userDocRef, { notebooks: updated }, { merge: true });
        }
    };

    return (
        <div className="gradient-bg min-h-screen text-white flex flex-col">
            <NotificationBanner message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'info' })} />
            {activeModal === 'profile' && <ProfileModal />}
            {activeModal === 'editSubjects' && <EditSubjectsModal />}
            {activeModal === 'timetable' && <TimetableModal />}
            {activeModal === 'missedAttendance' && <MissedAttendanceModal />}

            <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
                <button onClick={() => setActiveModal('profile')} title="Profile & Settings" className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full"><i className="fas fa-user-cog"></i></button>
                <button onClick={logout} title="Logout" className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"><i className="fas fa-sign-out-alt"></i></button>
                {isAdmin && (
                    <button onClick={() => setAdminPanelOpen(true)} title="Admin Recovery Panel" className="bg-yellow-700 hover:bg-yellow-800 text-white p-3 rounded-full"><i className="fas fa-tools"></i></button>
                )}
            </div>
            
            {adminPanelOpen && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center">
                    <div className="relative w-full max-w-2xl">
                        <button onClick={() => setAdminPanelOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-800 hover:bg-gray-600 text-white rounded-full px-3 py-1">&times;</button>
                        <AdminRecoveryPanel />
                    </div>
                </div>
            )}

            <DateTime />

            {infoOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-3xl w-full relative overflow-y-auto border-2 border-indigo-700" style={{ maxHeight: '90vh' }}>
                        <button onClick={() => setInfoOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-800 hover:bg-gray-600 text-white rounded-full px-3 py-1">&times;</button>
                        <h2 className="text-3xl font-bold mb-4 text-gradient">Punch.In App Guide & Help</h2>
                        <ul className="list-disc ml-6 space-y-3 text-lg">
                            <li><strong>Due List:</strong> Track all your upcoming deadlines, assignments, and exams. Add a title and due date, and the app will show how many days are left. Colors indicate urgency: <span className="bg-green-600 px-2 py-1 rounded">Green</span> (safe), <span className="bg-yellow-400 px-2 py-1 rounded">Yellow</span> (approaching), <span className="bg-red-500 px-2 py-1 rounded">Red</span> (urgent or overdue).</li>
                            <li><strong>Automatic Catch-Up:</strong> If you forget to use the app for a few days, Punch.In will automatically detect the missed dates and help you update your attendance in one go.</li>
                            <li><strong>Pods:</strong> Create or join collaborative groups to share attendance, timetable, and subjects. Admins can add/remove members. Use the <span className="font-semibold text-indigo-400">Pods</span> button to access all pod features.</li>
                        </ul>
                    </div>
                </div>
            )}

            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8">
                    <header className="text-center mb-12 pt-16">
                        <div className="inline-block mb-6"><div className="bg-white/5 p-4 rounded-full glow"><i className="fas fa-calendar-check text-5xl text-gradient"></i></div></div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">Punch.In Scholar Companion</h1>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Precision tracking for academic excellence.</p>
                    </header>
                    <div className="text-center mb-10 text-2xl font-light">Welcome, <span className="font-semibold text-gradient">{profile.displayName || currentUser.email}</span></div>

                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        <div className="flex-1 min-w-[300px] flex flex-col gap-4">
                            <DailyDashboard />
                            <LastPunchWidget />
                        </div>
                        <div className="flex-1 min-w-[300px]">
                            <DueCalendar />
                        </div>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Punch.in Apps</h2>
                        <div className="flex gap-6 flex-wrap">
                            <div className="flex flex-col items-center">
                                <button onClick={() => setInfoOpen(true)} title="App Info & Help" className="bg-indigo-500 hover:bg-indigo-700 text-white w-16 h-16 flex items-center justify-center rounded-xl text-3xl font-bold shadow-lg border-2 border-white/20">
                                    <i className="fas fa-question"></i>
                                </button>
                                <span className="text-xs mt-1 text-white/70">Help</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <button onClick={() => setPodsOpen(true)} title="Pods" className="bg-green-500 hover:bg-green-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-3xl font-bold shadow-lg border-2 border-white/20">
                                    <i className="fas fa-users"></i>
                                </button>
                                <span className="text-xs mt-1 text-white/70">Pods</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <button onClick={() => setNotesOpen(true)} title="Punch.in Notes" className="bg-yellow-500 hover:bg-yellow-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-3xl font-bold shadow-lg border-2 border-white/20">
                                    <i className="fas fa-sticky-note"></i>
                                </button>
                                <span className="text-xs mt-1 text-white/70">Notes</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <button onClick={() => checkForMissedAttendance()} title="Catch Up Missed Days" className="bg-pink-500 hover:bg-pink-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-3xl font-bold shadow-lg border-2 border-white/20">
                                    <i className="fas fa-calendar-plus"></i>
                                </button>
                                <span className="text-xs mt-1 text-white/70">Catch Up</span>
                            </div>
                            
                            {notesOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                                    <div className="relative w-full max-w-4xl">
                                        <button
                                            onClick={() => setNotesOpen(false)}
                                            className="fixed top-8 right-8 z-50 text-xl bg-gray-900 hover:bg-yellow-600 text-white rounded-full px-3 py-1"
                                            style={{ position: 'absolute' }}
                                        >
                                            &times;
                                        </button>
                                        <NotesEditor onClose={() => setNotesOpen(false)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    <AttendanceOverview />
                    <TimetableGlance />
                    <AIAssistant />
                    
                    <AskAI />

                    <div className="flex flex-col lg:flex-row gap-8">
                        <SubjectList />
                        <CalculatorPanel />
                    </div>

                    {podsOpen && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-3xl w-full relative overflow-y-auto pt-24" style={{ maxHeight: '90vh', backgroundColor: 'rgba(20, 22, 40, 0.98)' }}>
                                <button onClick={() => setPodsOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-800 hover:bg-gray-600 text-white rounded-full px-3 py-1">&times;</button>
                                <PodProvider>
                                    <section>
                                        <div className="absolute top-6 left-6 z-30">
                                            <button onClick={() => setPodsHelpOpen(true)} title="Pods Help" className="bg-indigo-500 hover:bg-indigo-700 text-white w-10 h-10 flex items-center justify-center rounded-full text-xl font-bold shadow-lg border-2 border-white/20">
                                                <i className="fas fa-info"></i>
                                            </button>
                                        </div>
                                        {podsHelpOpen && (
                                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                                                <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-xl w-full relative overflow-y-auto border-2 border-indigo-700" style={{ maxHeight: '90vh' }}>
                                                    <button onClick={() => setPodsHelpOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-800 hover:bg-gray-600 text-white rounded-full px-3 py-1">&times;</button>
                                                    <h2 className="text-2xl font-bold mb-3 text-gradient">Pods: Collaborative Academic Groups</h2>
                                                    <ul className="list-disc ml-6 space-y-2 text-base">
                                                        <li><strong>What are Pods?</strong> Pods are collaborative groups where you and your friends can share attendance, timetable, and subjects for strategic planning and bunk coordination.</li>
                                                        <li><strong>How to Create a Pod:</strong> Enter a name and click <span className="font-semibold text-indigo-400">Create Pod</span>. You become the admin.</li>
                                                        <li><strong>How to Join a Pod:</strong> Enter the Pod ID shared by your friend and click <span className="font-semibold text-green-400">Join Pod</span>.</li>
                                                        <li><strong>Admin Status:</strong> The first member in a pod is the admin. Admins can add or remove members and manage the pod.</li>
                                                        <li><strong>How to Add Members:</strong> Admins can add members by entering their User ID. Members can also join using the Pod ID.</li>
                                                        <li><strong>How to Copy Pod ID:</strong> Click the <span className="font-semibold text-gray-300">Copy</span> button next to any pod in your list to copy its ID to your clipboard for sharing.</li>
                                                        <li><strong>How to Copy User ID:</strong> In the Pod Members list, click the <span className="font-semibold text-gray-300">Copy</span> button next to a member to copy their User ID for adding or sharing.</li>
                                                        <li><strong>How to Copy User Timetable & Subject List:</strong> In the Pod Members list, click <span className="font-semibold text-indigo-400">Copy Data</span> next to a member to copy their subjects and timetable. <span className="text-yellow-300">Warning: This will overwrite your own subjects and timetable and reset your attendance.</span></li>
                                                        <li><strong>Leaderboard & Badges:</strong> View all pod members' attendance and earn badges for high performance and engagement.</li>
                                                        <li><strong>Collaborative Bunk Planner:</strong> Select pod members to find the best day for a group bunk. The planner analyzes everyone's schedule and attendance to minimize academic risk. All names are shown for clarity.</li>
                                                    </ul>
                                                    <div className="mt-4 text-yellow-300 text-sm">Note: Copying subjects/timetable from another member will reset your attendance. This action is irreversible.</div>
                                                </div>
                                            </div>
                                        )}
                                        <PodManager />
                                        <PodCopyConnector />
                                        <PodBadgesLeaderboard />
                                        <PodGroupAIProvider>
                                            <PodBunkPlannerWithContext />
                                        </PodGroupAIProvider>
                                    </section>
                                </PodProvider>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="w-full text-center p-8 text-white/50 text-sm">
                <div className="mb-2">
                    <Link to="/privacy" className="hover:text-white/80 mx-2">Privacy Policy</Link> |
                    <Link to="/terms" className="hover:text-white/80 mx-2">Terms & Conditions</Link>
                </div>
                <p>Copyright &copy; 2025 Aadithya Vimal</p>
            </footer>
        </div>
    );
};

export default HomePage;