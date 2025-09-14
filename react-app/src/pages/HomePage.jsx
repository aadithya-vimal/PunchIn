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
    return (
        <div className="gradient-bg min-h-screen text-white flex flex-col">
            {activeModal === 'profile' && <ProfileModal />}
            {activeModal === 'editSubjects' && <EditSubjectsModal />}
            {activeModal === 'timetable' && <TimetableModal />}

            <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
                <button onClick={() => setPodsOpen(true)} title="Pods" className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-full"><i className="fas fa-users"></i></button>
                <button onClick={() => setActiveModal('profile')} title="Profile & Settings" className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full"><i className="fas fa-user-cog"></i></button>
                <button onClick={logout} title="Logout" className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"><i className="fas fa-sign-out-alt"></i></button>
            </div>

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
                    <DailyDashboard />
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
                            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white rounded-xl shadow-2xl p-8 max-w-3xl w-full relative overflow-y-auto" style={{maxHeight: '90vh', backgroundColor: 'rgba(20, 22, 40, 0.98)'}}>
                                <button onClick={() => setPodsOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-800 hover:bg-gray-600 text-white rounded-full px-3 py-1">&times;</button>
                                <PodProvider>
                                    <section>
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
