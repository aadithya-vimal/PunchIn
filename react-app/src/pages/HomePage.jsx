import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext.jsx';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Core Components
import DateTime from '../components/DateTime.jsx';
import NotificationBanner from '../components/NotificationBanner.jsx';
import DailyDashboard from '../components/DailyDashboard.jsx';
import LastPunchWidget from '../components/LastPunchWidget.jsx';
import DueCalendar from '../components/DueCalendar.jsx';
import AttendanceOverview from '../components/AttendanceOverview.jsx';
import TimetableGlance from '../components/TimetableGlance.jsx';
import AskAI from '../components/AskAI.jsx';
import SubjectList from '../components/SubjectList.jsx';
import CalculatorPanel from '../components/CalculatorPanel.jsx';

// Modals
import ProfileModal from '../components/ProfileModal.jsx';
import EditSubjectsModal from '../components/EditSubjectsModal.jsx';
import TimetableModal from '../components/TimetableModal.jsx';
import MissedAttendanceModal from '../components/MissedAttendanceModal.jsx';
import NotesEditor from '../components/NotesEditor.jsx';
import AdminRecoveryPanel from '../components/AdminRecoveryPanel.jsx';
import TimingsModal from '../components/TimingsModal.jsx'; // NEW IMPORT

// Pods System
import { PodProvider } from '../pods/PodContext.jsx';
import PodManager from '../pods/PodManager.jsx';
import PodMemberList from '../pods/PodMemberList.jsx';
import PodCopyFeature from '../pods/PodCopyFeature.jsx';
import PodBadgesLeaderboard from '../pods/PodBadgesLeaderboard.jsx';
import PodBunkPlanner from '../pods/PodBunkPlanner.jsx';
import { PodGroupAIProvider, PodGroupAIContext } from '../pods/PodGroupAIContext.jsx';

// Wrapper for Pod Logic
function PodSection() {
    const [podsHelpOpen, setPodsHelpOpen] = useState(false);
    const [copyUid, setCopyUid] = useState(null);
    const [copyData, setCopyData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Context Bridge
    const BunkPlanner = () => {
        const { getGroupBunkRecommendation } = React.useContext(PodGroupAIContext);
        return <PodBunkPlanner getGroupBunkRecommendation={getGroupBunkRecommendation} />;
    };

    return (
        <PodProvider>
            <div className="relative">
                <div className="absolute top-6 left-6 z-30">
                    <button onClick={() => setPodsHelpOpen(true)} className="bg-indigo-500 hover:bg-indigo-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-white/20">
                        <i className="fas fa-info"></i>
                    </button>
                </div>
                
                {podsHelpOpen && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-xl w-full relative border-2 border-indigo-700">
                            <button onClick={() => setPodsHelpOpen(false)} className="absolute top-4 right-4 text-xl bg-white/20 hover:bg-white/40 rounded-full px-3">&times;</button>
                            <h2 className="text-2xl font-bold mb-3">Pods Help</h2>
                            <p>Pods are collaborative groups for sharing attendance data and planning bunks together.</p>
                        </div>
                    </div>
                )}

                <PodManager />
                <PodMemberList 
                    onCopyMemberData={(uid, data) => { setCopyUid(uid); setCopyData(data); setModalOpen(true); }} 
                />
                <PodCopyFeature selectedUid={copyUid} memberData={copyData} modalOpen={modalOpen} setModalOpen={setModalOpen} />
                <PodBadgesLeaderboard />
                <PodGroupAIProvider>
                    <BunkPlanner />
                </PodGroupAIProvider>
            </div>
        </PodProvider>
    );
}

const HomePage = () => {
    const { currentUser, profile, logout, activeModal, setActiveModal, isAdmin, checkForMissedAttendance, autoPunch, saveData } = useContext(UserContext);

    // App Visibility States
    const [podsOpen, setPodsOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [timingsOpen, setTimingsOpen] = useState(false); // NEW STATE
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'info' });

    // Auto-Check Missed Attendance (Once on mount)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentUser) checkForMissedAttendance();
        }, 2000);
        return () => clearTimeout(timer);
    }, [currentUser]);

    const handleAutoPunchToggle = () => {
        saveData({ autoPunch: !autoPunch });
    };

    return (
        <div className="gradient-bg min-h-screen text-white flex flex-col">
            <NotificationBanner message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'info' })} />
            
            {/* Global Modals */}
            {activeModal === 'profile' && <ProfileModal />}
            {activeModal === 'editSubjects' && <EditSubjectsModal />}
            {activeModal === 'timetable' && <TimetableModal />}
            {activeModal === 'missedAttendance' && <MissedAttendanceModal />}
            {timingsOpen && <TimingsModal onClose={() => setTimingsOpen(false)} />} {/* NEW MODAL */}

            {/* Top Bar */}
            <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
                <button onClick={() => setActiveModal('profile')} className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg"><i className="fas fa-user-cog"></i></button>
                <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"><i className="fas fa-sign-out-alt"></i></button>
                {isAdmin && <button onClick={() => setAdminPanelOpen(true)} className="bg-yellow-700 hover:bg-yellow-800 text-white p-3 rounded-full"><i className="fas fa-tools"></i></button>}
            </div>
            
            {adminPanelOpen && <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center"><div className="relative w-full max-w-2xl"><button onClick={() => setAdminPanelOpen(false)} className="absolute top-4 right-4 text-xl bg-white/20 rounded-full px-3">&times;</button><AdminRecoveryPanel /></div></div>}

            <DateTime />

            {/* Info / Help Modal */}
            {infoOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-3xl w-full relative overflow-y-auto border-2 border-indigo-700" style={{ maxHeight: '90vh' }}>
                        <button onClick={() => setInfoOpen(false)} className="absolute top-4 right-4 text-xl bg-white/20 hover:bg-white/40 rounded-full px-3">&times;</button>
                        <h2 className="text-3xl font-bold mb-4">Punch.In Guide</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>Auto Punch:</strong> Enable this to automatically mark attendance for classes as they happen. Make sure to configure your class timings!</li>
                            <li><strong>Catch Up:</strong> Fix missing attendance records for previous days.</li>
                            <li><strong>Pods:</strong> Collaborate with friends.</li>
                        </ul>
                    </div>
                </div>
            )}

            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <header className="text-center mb-12 pt-16">
                        <div className="inline-block mb-6"><div className="bg-white/5 p-4 rounded-full glow"><i className="fas fa-calendar-check text-5xl text-gradient"></i></div></div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">Punch.In</h1>
                        <p className="text-xl opacity-90">Precision tracking for academic excellence.</p>
                        <div className="mt-4 text-2xl font-light">Welcome, <span className="font-semibold text-gradient">{profile.displayName || currentUser?.email?.split('@')[0]}</span></div>
                    </header>

                    {/* NEW: Auto Punch Control Panel */}
                    <div className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-colors ${autoPunch ? 'bg-green-500/20 border-green-500' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm uppercase tracking-wider">{autoPunch ? 'Auto Punch Active' : 'Auto Punch Off'}</span>
                                <span className="text-xs text-white/50">{autoPunch ? 'Attendance marks automatically' : 'Manual marking only'}</span>
                            </div>
                            <button 
                                onClick={handleAutoPunchToggle}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${autoPunch ? 'bg-green-500' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${autoPunch ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                        
                        {/* Only show config button if Auto Punch is enabled or user wants to setup */}
                        <button 
                            onClick={() => setTimingsOpen(true)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <i className="fas fa-clock"></i>
                            <span className="text-sm font-semibold">Configure Timings</span>
                        </button>
                    </div>

                    {/* Dashboard Widgets */}
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        <div className="flex-1 min-w-[300px] flex flex-col gap-4">
                            <DailyDashboard />
                            <LastPunchWidget />
                        </div>
                        <div className="flex-1 min-w-[300px]">
                            <DueCalendar />
                        </div>
                    </div>

                    {/* Apps Grid */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Apps</h2>
                        <div className="flex gap-6 flex-wrap">
                            <AppIcon icon="fas fa-question" color="bg-indigo-500" label="Help" onClick={() => setInfoOpen(true)} />
                            <AppIcon icon="fas fa-users" color="bg-green-500" label="Pods" onClick={() => setPodsOpen(true)} />
                            <AppIcon icon="fas fa-sticky-note" color="bg-yellow-500" label="Notes" onClick={() => setNotesOpen(true)} />
                            <AppIcon icon="fas fa-calendar-plus" color="bg-pink-500" label="Catch Up" onClick={() => checkForMissedAttendance()} />
                        </div>
                        
                        {/* Notes Modal */}
                        {notesOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                                <div className="relative w-full max-w-4xl">
                                    <button onClick={() => setNotesOpen(false)} className="absolute -top-10 right-0 text-xl bg-white/20 hover:bg-red-500 text-white rounded-full px-3 py-1">&times;</button>
                                    <NotesEditor onClose={() => setNotesOpen(false)} />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Main Content */}
                    <AttendanceOverview />
                    <TimetableGlance />
                    <AskAI />

                    <div className="flex flex-col lg:flex-row gap-8">
                        <SubjectList />
                        <CalculatorPanel />
                    </div>

                    {/* Pods Modal Overlay */}
                    {podsOpen && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-3xl w-full relative overflow-y-auto pt-16" style={{ maxHeight: '90vh', backgroundColor: 'rgba(20, 22, 40, 0.98)' }}>
                                <button onClick={() => setPodsOpen(false)} className="absolute top-4 right-4 text-xl bg-white/20 hover:bg-white/40 rounded-full px-3">&times;</button>
                                <PodSection />
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="w-full text-center p-8 text-white/50 text-sm">
                <p>&copy; 2025 Punch.In</p>
                <div className="mt-2"><Link to="/privacy" className="hover:text-white mx-2">Privacy</Link>|<Link to="/terms" className="hover:text-white mx-2">Terms</Link></div>
            </footer>
        </div>
    );
};

// Helper Component for App Icons
const AppIcon = ({ icon, color, label, onClick }) => (
    <div className="flex flex-col items-center">
        <button onClick={onClick} className={`${color} hover:brightness-110 text-white w-16 h-16 flex items-center justify-center rounded-xl text-3xl font-bold shadow-lg border-2 border-white/20 transition-transform active:scale-95`}>
            <i className={icon}></i>
        </button>
        <span className="text-xs mt-1 text-white/70">{label}</span>
    </div>
);

export default HomePage;