import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from './context/UserContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import DateTime from './components/DateTime.jsx';

function App() {
  const { currentUser, isLoading } = useContext(UserContext); 

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      {/* Render DateTime at top-left on all pages */}
      <DateTime />

      <Routes>
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/" element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
