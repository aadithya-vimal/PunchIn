import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from '../firebase/config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCredentialResponse = async (response) => {
    try {
      const idToken = response.credential;
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error("Firebase Google sign-in error:", error);
      setErrorMessage('Failed to sign in with Google.');
    }
  };

  const handleGoogleInit = () => {
    try {
      if (window.google) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.warn("Google Client ID is missing in environment variables.");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button-container"),
          { theme: "outline", size: "large", text: "sign_in_with", shape: "rectangular", logo_alignment: "left", width: "320" }
        );
      }
    } catch (e) {
      console.error("Google Sign-In script failed to initialize.", e);
    }
  };

  useEffect(() => {
    let scriptTimeout;
    const checkScriptLoaded = () => {
      if (window.google?.accounts?.id?.initialize) {
        handleGoogleInit();
        return true;
      }
      return false;
    };

    if (!checkScriptLoaded()) {
      window.addEventListener('load', handleGoogleInit);
      scriptTimeout = setTimeout(() => {
        if (!checkScriptLoaded()) {
          console.warn("Google Sign-In script load timeout.");
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('load', handleGoogleInit);
      if (scriptTimeout) clearTimeout(scriptTimeout);
    };
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSignUpMode) {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if (error.code === 'auth/weak-password') {
          setErrorMessage('Password should be at least 6 characters.');
        } else if (error.code === 'auth/email-already-in-use') {
          setErrorMessage('This email is already registered.');
        } else {
          setErrorMessage('Failed to create account.');
        }
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        setErrorMessage('Invalid email or password.');
      }
    }
  };

  const toggleAuthMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setErrorMessage('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="gradient-bg min-h-screen flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-sky-500/30">
      
      {/* Top back button to landing page */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-colors"
        >
          <i className="fas fa-arrow-left text-[10px]"></i>
          <span>Back to Landing</span>
        </Link>
        <span className="text-xs text-white/40 font-mono">Punch.In Secure Auth</span>
      </div>

      <main className="w-full max-w-md mx-auto my-auto py-8">
        
        {/* Apple card container */}
        <div className="login-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/20 mb-3">
              <i className="fas fa-check-double text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isSignUpMode ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Precision attendance tracking, pods & bunk planning
            </p>
          </div>

          <div id="google-signin-button-container" className="flex justify-center mb-4"></div>

          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-3 text-white/40 text-[11px] uppercase tracking-wider font-semibold">Or with email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                placeholder="student@university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className={isSignUpMode ? 'form-field-visible' : 'form-field-hidden'}>
              <label htmlFor="confirm-password" className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                placeholder="••••••••"
                required={isSignUpMode}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="apple-btn-primary w-full text-xs font-bold py-3 mt-2 shadow-lg"
            >
              {isSignUpMode ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs text-center flex items-center justify-center gap-1.5">
              <i className="fas fa-circle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="mt-6 text-center pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs">
              {isSignUpMode ? 'Already registered? ' : "Don't have an account? "}
              <button 
                onClick={toggleAuthMode} 
                className="text-sky-400 hover:text-sky-300 font-semibold ml-1 cursor-pointer"
              >
                {isSignUpMode ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-4 text-white/40 text-xs">
        <p>Punch.In &bull; Academic Scholar Platform &bull; Aadithya Vimal</p>
      </footer>
    </div>
  );
};

export default LoginPage;
