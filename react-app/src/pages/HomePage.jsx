import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext.jsx';

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
import AdminRecoveryPanel from '../components/AdminRecoveryPanel.jsx';
import TimingsModal from '../components/TimingsModal.jsx';

// Pods System
import { PodProvider } from '../pods/PodContext.jsx';
import PodManager from '../pods/PodManager.jsx';
import PodBadgesLeaderboard from '../pods/PodBadgesLeaderboard.jsx';
import PodBunkPlanner from '../pods/PodBunkPlanner.jsx';
import { PodGroupAIProvider, PodGroupAIContext } from '../pods/PodGroupAIContext.jsx';

// Wrapper for Pod Logic
function PodSection() {
    const BunkPlanner = () => {
        const { getGroupBunkRecommendation } = React.useContext(PodGroupAIContext);
        return <PodBunkPlanner getGroupBunkRecommendation={getGroupBunkRecommendation} />;
    };

    return (
        <PodProvider>
            <div className="space-y-6">
                <PodManager />
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
    const [timingsOpen, setTimingsOpen] = useState(false);
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
        <div className="gradient-bg min-h-screen text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white overflow-x-hidden">
            <NotificationBanner message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'info' })} />
            
            {/* Global Modals */}
            {activeModal === 'profile' && <ProfileModal />}
            {activeModal === 'editSubjects' && <EditSubjectsModal />}
            {activeModal === 'timetable' && <TimetableModal />}
            {activeModal === 'missedAttendance' && <MissedAttendanceModal />}
            {timingsOpen && <TimingsModal onClose={() => setTimingsOpen(false)} />}

            {/* Top Navigation & Status Bar - Fully Responsive */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#07090e]/85 border-b border-white/[0.06] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <img 
                        src="/AttendanceApplication.ico" 
                        alt="Logo" 
                        className="w-6 h-6 object-contain shrink-0" 
                    />
                    <div className="min-w-0">
                        <DateTime />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Auto Punch Indicator Pill */}
                    <button 
                        onClick={handleAutoPunchToggle}
                        className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            autoPunch 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                        }`}
                        title="Toggle Auto Punch"
                    >
                        <span className={`w-2 h-2 rounded-full ${autoPunch ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`}></span>
                        <span>Auto-Punch {autoPunch ? 'On' : 'Off'}</span>
                    </button>

                    <Link
                        to="/bunk-engine"
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all text-xs"
                        title="Bunk Engine Simulator"
                    >
                        <i className="fas fa-calculator text-[11px]"></i>
                    </Link>

                    <button 
                        onClick={() => setTimingsOpen(true)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all text-xs"
                        title="Configure Period Timings"
                    >
                        <i className="fas fa-clock text-[11px]"></i>
                    </button>

                    <button 
                        onClick={() => setActiveModal('profile')} 
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all text-xs"
                        title="Account & Settings"
                    >
                        <i className="fas fa-user text-[11px]"></i>
                    </button>

                    {isAdmin && (
                        <button 
                            onClick={() => setAdminPanelOpen(true)} 
                            className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 flex items-center justify-center transition-all text-xs"
                            title="Admin Diagnostics"
                        >
                            <i className="fas fa-tools text-[11px]"></i>
                        </button>
                    )}

                    <button 
                        onClick={logout} 
                        className="w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 flex items-center justify-center transition-all text-xs"
                        title="Sign Out"
                    >
                        <i className="fas fa-arrow-right-from-bracket text-[11px]"></i>
                    </button>
                </div>
            </div>
            
            {adminPanelOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl">
                        <button 
                            onClick={() => setAdminPanelOpen(false)} 
                            className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <AdminRecoveryPanel />
                    </div>
                </div>
            )}

            {/* Info / Help Modal */}
            {infoOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
                    <div className="apple-card bg-[#0f131c]/98 border border-white/10 text-white p-5 sm:p-7 max-w-2xl w-full relative max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                                <i className="fas fa-circle-question text-sky-400"></i>
                                Punch.In Guide & Tips
                            </h2>
                            <button 
                                onClick={() => setInfoOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center text-xs"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="space-y-3 text-xs text-white/70 leading-relaxed">
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                <strong className="text-white block mb-1">Direct Percentage Adjustments:</strong>
                                Click the pen icon on any subject in the Subjects list or Attendance Overview to directly set your current attendance % or target.
                            </div>
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                <strong className="text-white block mb-1">Free Periods:</strong>
                                Assign "Free / No Period" to any period slot in the Timetable Modal. Free periods are excluded from auto-punching and bunk metrics.
                            </div>
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                <strong className="text-white block mb-1">Study Pods:</strong>
                                Join a class Pod with a Pod ID and click "Copy Timetable" to import your classmate's entire weekly schedule in one second.
                            </div>
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                <strong className="text-white block mb-1">Permanent Data Wipe:</strong>
                                Head into Profile & Settings &gt; Danger Zone whenever you need to permanently purge all subjects, timetable, and attendance history.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
                    
                    {/* Welcome Header */}
                    <header className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-white/[0.06]">
                            <div>
                                <span className="apple-badge mb-1.5 text-[10px]">Academic Dashboard</span>
                                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                                    Hello, <span className="text-gradient">{profile.displayName || currentUser?.email?.split('@')[0]}</span>
                                </h1>
                                <p className="text-xs text-white/50 mt-0.5">
                                    Precision analytics & attendance tracking for this semester.
                                </p>
                            </div>

                            {/* Quick Action Dock */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button 
                                    onClick={() => setPodsOpen(true)}
                                    className="apple-btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
                                >
                                    <i className="fas fa-users-viewfinder text-xs"></i>
                                    <span>Study Pods</span>
                                </button>
                                <button 
                                    onClick={() => checkForMissedAttendance()}
                                    className="apple-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
                                    title="Catch up missed classes"
                                >
                                    <i className="fas fa-calendar-check text-xs"></i>
                                    <span>Catch Up</span>
                                </button>
                                <button 
                                    onClick={() => setInfoOpen(true)}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors text-xs"
                                    title="Help Guide"
                                >
                                    <i className="fas fa-question text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Today's Schedule & Attendance Widgets */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <DailyDashboard />
                            <LastPunchWidget />
                        </div>
                        <div>
                            <DueCalendar />
                        </div>
                    </div>

                    {/* Live Attendance Overview Section */}
                    <AttendanceOverview />

                    {/* Weekly Schedule Glance */}
                    <TimetableGlance />

                    {/* AI Advisor Panel */}
                    <AskAI />

                    {/* Subjects and Bunk Calculator */}
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8">
                        <SubjectList />
                        <CalculatorPanel />
                    </div>

                    {/* Pods Modal Overlay */}
                    {podsOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
                            <div className="apple-card bg-[#0a0d14]/98 border border-white/15 text-white p-4 sm:p-7 max-w-4xl w-full relative overflow-y-auto max-h-[92vh] shadow-2xl">
                                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                                            <i className="fas fa-users"></i>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Study Pods Network</h3>
                                    </div>
                                    <button 
                                        onClick={() => setPodsOpen(false)} 
                                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center text-xs"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <PodSection />
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Apple style minimal footer */}
            <footer className="w-full border-t border-white/[0.06] bg-[#07090e] py-6 px-4 sm:px-8 text-xs text-white/40 mt-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <img src="/AttendanceApplication.ico" alt="Logo" className="w-4 h-4 object-contain" />
                        <span className="font-semibold text-white/70">Punch.In Companion</span>
                        <span>&copy; {new Date().getFullYear()} Aadithya Vimal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/calculator" className="hover:text-white transition-colors">Calculator</Link>
                        <Link to="/bunk-engine" className="hover:text-white transition-colors">Bunk Engine</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <a href="mailto:aadithyavimal.work@gmail.com" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
