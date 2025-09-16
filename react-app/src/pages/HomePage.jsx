// Connector for PodMemberList and PodCopyFeature
function PodCopyConnector() {
    const [copyUid, setCopyUid] = useState(null);
    const [copyData, setCopyData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <>
            <PodMemberList
                onSelectMember={() => {}}
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
import React, { useContext, useState } from 'react';
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
import AIStudyPlanner from '../components/AIStudyPlanner.jsx';
import AITopicSuggester from '../components/AITopicSuggester.jsx';
import DateTime from '../components/DateTime.jsx';
import PodManager from '../pods/PodManager.jsx';
import PodMemberList from '../pods/PodMemberList.jsx';
import PodCopyFeature from '../pods/PodCopyFeature.jsx';
import { PodProvider } from '../pods/PodContext.jsx';
import PodBadgesLeaderboard from '../pods/PodBadgesLeaderboard.jsx';
import { PodGroupAIProvider, PodGroupAIContext } from '../pods/PodGroupAIContext.jsx';
import PodBunkPlanner from '../pods/PodBunkPlanner.jsx';

// PodBunkPlanner with context
function PodBunkPlannerWithContext() {
    const { getGroupBunkRecommendation } = React.useContext(PodGroupAIContext);
    return <PodBunkPlanner getGroupBunkRecommendation={getGroupBunkRecommendation} />;
}

const HomePage = () => {
    const { currentUser, profile, logout, activeModal, setActiveModal } = useContext(UserContext);

    const [podsOpen, setPodsOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    // Notes app state
    const [notesOpen, setNotesOpen] = useState(false);
    const [notebooks, setNotebooks] = useState([]);
    const [newNotebookName, setNewNotebookName] = useState("");
    const [noteInputs, setNoteInputs] = useState({});
    // Pods help modal state
    const [podsHelpOpen, setPodsHelpOpen] = useState(false);

    // Notes app handlers
    const handleCreateNotebook = (e) => {
        e.preventDefault();
        if (!newNotebookName.trim()) return;
        setNotebooks([...notebooks, { id: Date.now(), name: newNotebookName.trim(), notes: [] }]);
        setNewNotebookName("");
    };
    const handleDeleteNotebook = (id) => {
        setNotebooks(notebooks.filter(nb => nb.id !== id));
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
        setNotebooks(notebooks.map(nb => nb.id === notebookId ? { ...nb, notes: [...nb.notes, note] } : nb));
        setNoteInputs(inputs => ({ ...inputs, [notebookId]: "" }));
    };
    const handleDeleteNote = (notebookId, noteIdx) => {
        setNotebooks(notebooks.map(nb => nb.id === notebookId ? { ...nb, notes: nb.notes.filter((_, idx) => idx !== noteIdx) } : nb));
    };
    return (
        <div className="gradient-bg min-h-screen text-white flex flex-col">
            {activeModal === 'profile' && <ProfileModal />}
            {activeModal === 'editSubjects' && <EditSubjectsModal />}
            {activeModal === 'timetable' && <TimetableModal />}

            <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
                <button onClick={() => setActiveModal('profile')} title="Profile & Settings" className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full"><i className="fas fa-user-cog"></i></button>
                <button onClick={logout} title="Logout" className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"><i className="fas fa-sign-out-alt"></i></button>
            </div>

            <DateTime />

            {/* Info Modal */}
            {infoOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-3xl w-full relative overflow-y-auto border-2 border-indigo-700" style={{maxHeight: '90vh'}}>
                        <button onClick={() => setInfoOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-800 hover:bg-gray-600 text-white rounded-full px-3 py-1">&times;</button>
                        <h2 className="text-3xl font-bold mb-4 text-gradient">Punch.In App Guide & Help</h2>
                        <ul className="list-disc ml-6 space-y-3 text-lg">
                            <li><strong>Due List:</strong> Track all your upcoming deadlines, assignments, and exams. Add a title and due date, and the app will show how many days are left. Colors indicate urgency: <span className="bg-green-600 px-2 py-1 rounded">Green</span> (safe), <span className="bg-yellow-400 px-2 py-1 rounded">Yellow</span> (approaching), <span className="bg-red-500 px-2 py-1 rounded">Red</span> (urgent or overdue).</li>
                            <li><strong>How to Use Due List:</strong> Enter a title and due date, then click Add. The list will update with days left and color severity. Use it to stay on top of all your academic tasks!</li>
                            <li><strong>Pods:</strong> Create or join collaborative groups to share attendance, timetable, and subjects. Admins can add/remove members. Use the <span className="font-semibold text-indigo-400">Pods</span> button to access all pod features.</li>
                            <li><strong>Pod Admin Controls:</strong> Admins can add or remove members, manage pod settings, and oversee group activities. Only the first member is admin.</li>
                            <li><strong>Copy Timetable & Subjects:</strong> In the Pod Members list, use <span className="font-semibold text-indigo-400">Copy Data</span> to copy another member's timetable and subjects. <span className="text-yellow-300">Warning: This will overwrite your own data and reset attendance.</span></li>
                            <li><strong>Copy Pod/User ID:</strong> Use the <span className="font-semibold text-gray-300">Copy</span> button next to pods or users to copy their IDs for sharing or adding members.</li>
                            <li><strong>Delete Entire Data:</strong> In your profile window, use <span className="font-semibold text-red-400">Delete Timetable & Subject List</span> for a double-confirmed, irreversible deletion of your academic data.</li>
                            <li><strong>Attendance Calculation:</strong> Attendance is calculated as <span className="font-mono">(Total Attended / Total Classes) × 100</span>. Your overall attendance is shown in your stats and leaderboard. Each subject tracks its own attendance.</li>
                            <li><strong>Adding Attendance Data:</strong> Use <span className="font-semibold text-indigo-400">All Subjects Attendance</span> to enter class data and required attendance percentage for each subject. The app tracks and updates your attendance automatically.</li>
                            <li><strong>Timetable Glance:</strong> View your weekly timetable at a glance, including all subjects and periods. Easily spot free slots and busy days.</li>
                            <li><strong>Daily Dashboard:</strong> See your daily attendance, upcoming classes, and quick stats for the day.</li>
                            <li><strong>AI Study Planner:</strong> Get personalized study plans based on your attendance, timetable, and academic goals.</li>
                            <li><strong>AI Topic Suggester:</strong> Receive topic suggestions for revision and improvement, tailored to your weak areas.</li>
                            <li><strong>Collaborative Bunk Planner:</strong> Select pod members to find the best day for a group bunk. The planner analyzes everyone's schedule and attendance to minimize academic risk. All names are shown for clarity.</li>
                            <li><strong>Leaderboard & Badges:</strong> View all pod members' attendance and earn badges for high performance and engagement. Compete with friends for top spots.</li>
                            <li><strong>Profile & Settings:</strong> Update your display name, view your email, and manage your academic data securely.</li>
                            <li><strong>Privacy & Security:</strong> Your data is stored securely and is only accessible to you. Review our <Link to="/privacy" className="underline text-indigo-300">Privacy Policy</Link> for details.</li>
                            <li><strong>Terms & Conditions:</strong> Understand how Punch.In works and your rights as a user. See <Link to="/terms" className="underline text-indigo-300">Terms</Link>.</li>
                            <li><strong>Tooltips & Help:</strong> Hover over any button for instant help and explanations of features.</li>
                            <li><strong>Mobile Friendly:</strong> The app is fully responsive and works great on phones, tablets, and desktops.</li>
                            <li><strong>Fast & Secure:</strong> Built with modern technologies for speed, reliability, and security.</li>
                            <li><strong>How to Get Started:</strong> Add your subjects, set up your timetable, and start tracking attendance. Join or create a pod to collaborate with friends.</li>
                            <li><strong>Support:</strong> For issues or feedback, contact the developer via the GitHub repo or support email.</li>
                        </ul>
                        <div className="mt-6 text-indigo-200 text-base">For more help, hover over any button for tooltips, or visit the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link> pages.</div>
                    </div>
                </div>
            )}

            <DateTime />

            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8">
                    <header className="text-center mb-12 pt-16">
                        <div className="inline-block mb-6"><div className="bg-white/5 p-4 rounded-full glow"><i className="fas fa-calendar-check text-5xl text-gradient"></i></div></div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">Punch.In Scholar Companion</h1>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Precision tracking for academic excellence.</p>
                    </header>
                    <div className="text-center mb-10 text-2xl font-light">Welcome, <span className="font-semibold text-gradient">{profile.displayName || currentUser.email}</span></div>

                    {/* Punch.in Section Always on Top */}
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        <div className="flex-1 min-w-[300px]">
                            <DailyDashboard />
                        </div>
                        <div className="flex-1 min-w-[300px]">
                            <DueCalendar />
                        </div>
                    </div>

                    {/* Punch.in Apps Section */}
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
                    {/* Notes App Modal */}
                    {notesOpen && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                            <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-white text-gray-900 rounded-xl shadow-2xl p-8 max-w-2xl w-full relative overflow-y-auto" style={{maxHeight: '90vh', backgroundColor: 'rgba(255, 255, 220, 0.98)'}}>
                                <button onClick={() => setNotesOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-200 hover:bg-yellow-200 text-gray-900 rounded-full px-3 py-1">&times;</button>
                                {/* Notes app content */}
                                <h2 className="text-2xl font-bold mb-4 text-yellow-700">Punch.in Notes</h2>
                                <div className="mb-6 text-base text-gray-700">Create notebooks and add notes for your subjects, tasks, or ideas. All notes are private and stored locally.</div>
                                {/* Notebooks List & Creation */}
                                <div className="mb-6">
                                    <form className="flex gap-2" onSubmit={handleCreateNotebook}>
                                        <input type="text" value={newNotebookName} onChange={e => setNewNotebookName(e.target.value)} placeholder="New Notebook Name" className="border border-yellow-400 rounded px-3 py-2 w-full" />
                                        <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded">Create</button>
                                    </form>
                                </div>
                                {/* Notebooks Display */}
                                <div className="space-y-4">
                                    {notebooks.length === 0 ? (
                                        <div className="text-gray-500">No notebooks yet. Create one above!</div>
                                    ) : (
                                        notebooks.map((notebook, idx) => (
                                            <div key={notebook.id} className="border border-yellow-300 rounded-lg p-4 bg-white/80">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-lg text-yellow-700">{notebook.name}</span>
                                                    <button onClick={() => handleDeleteNotebook(notebook.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                                </div>
                                                {/* Notes List & Creation */}
                                                <form className="flex gap-2 mb-2" onSubmit={e => handleAddNote(e, notebook.id)}>
                                                    <input type="text" value={noteInputs[notebook.id] || ''} onChange={e => setNoteInputs({ ...noteInputs, [notebook.id]: e.target.value })} placeholder="Add a note..." className="border border-yellow-400 rounded px-2 py-1 w-full" />
                                                    <button type="submit" className="bg-yellow-300 hover:bg-yellow-400 text-white font-bold px-3 py-1 rounded">Add</button>
                                                </form>
                                                <ul className="list-disc ml-6">
                                                    {notebook.notes.length === 0 ? (
                                                        <li className="text-gray-400">No notes yet.</li>
                                                    ) : (
                                                        notebook.notes.map((note, nidx) => (
                                                            <li key={nidx} className="flex justify-between items-center py-1">
                                                                <span>{note}</span>
                                                                <button onClick={() => handleDeleteNote(notebook.id, nidx)} className="text-red-400 hover:text-red-600 text-xs ml-2">Delete</button>
                                                            </li>
                                                        ))
                                                    )}
                                                </ul>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                        </div>
                    </section>
                    <AttendanceOverview />
                    <TimetableGlance />
                    <AIAssistant />
                    <AIStudyPlanner />
                    <AITopicSuggester />

                    <div className="flex flex-col lg:flex-row gap-8">
                        <SubjectList />
                        <CalculatorPanel />
                    </div>

                    {/* Pods Modal */}
                    {podsOpen && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-3xl w-full relative overflow-y-auto pt-24" style={{maxHeight: '90vh', backgroundColor: 'rgba(20, 22, 40, 0.98)'}}>
                                <button onClick={() => setPodsOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-800 hover:bg-gray-600 text-white rounded-full px-3 py-1">&times;</button>
                                <PodProvider>
                                    <section>
                                        {/* Pods Help Info Button - moved to top left */}
                                        <div className="absolute top-6 left-6 z-30">
                                            <button onClick={() => setPodsHelpOpen(true)} title="Pods Help" className="bg-indigo-500 hover:bg-indigo-700 text-white w-10 h-10 flex items-center justify-center rounded-full text-xl font-bold shadow-lg border-2 border-white/20">
                                                <i className="fas fa-info"></i>
                                            </button>
                                        </div>
                                        {podsHelpOpen && (
                                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                                                <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-xl w-full relative overflow-y-auto border-2 border-indigo-700" style={{maxHeight: '90vh'}}>
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
