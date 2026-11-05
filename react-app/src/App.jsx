import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from './context/UserContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AttendanceCalculatorPage from './pages/AttendanceCalculatorPage.jsx';
import BunkEnginePage from './pages/BunkEnginePage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';

function App() {
  const { currentUser, isLoading } = useContext(UserContext); 

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
            <img src="/AttendanceApplication.ico" alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div className="text-[11px] text-white/50 tracking-wider font-mono">LOADING PUNCH.IN...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* If logged in, "/" goes directly to HomePage; if not logged in, "/" shows the detailed product landing page */}
        <Route path="/" element={currentUser ? <HomePage /> : <LandingPage />} />
        
        {/* /app route shortcut */}
        <Route path="/app" element={currentUser ? <HomePage /> : <Navigate to="/login" />} />

        {/* Public Utility & SEO Pages */}
        <Route path="/calculator" element={<AttendanceCalculatorPage />} />
        <Route path="/bunk-engine" element={<BunkEnginePage />} />

        {/* Login route redirects to home if already authenticated */}
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />

        {/* Static Legal / Terms pages */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
