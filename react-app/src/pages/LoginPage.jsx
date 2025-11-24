import React, { useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithCredential, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth } from '../firebase/config'; // Import auth from our config

const LoginPage = () => {
  // State for managing the form inputs and mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Google Sign-In Handler ---
  const handleCredentialResponse = async (response) => {
    try {
      const idToken = response.credential;
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      // The router in App.jsx will automatically redirect to the home page
    } catch (error) {
      console.error("Firebase Google sign-in error:", error);
      setErrorMessage('Failed to sign in with Google.');
    }
  };

  // --- New function to handle Google Initialization ---
  const handleGoogleInit = () => {
    try {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "1061249192401-e3in38qaqiqi4avu5pqkjkp86pjnnh9r.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button-container"),
          { theme: "outline", size: "large", text: "sign_in_with", shape: "rectangular", logo_alignment: "left", width: "320" }
        );
      }
    } catch (e) {
      console.error("Google Sign-In script failed to initialize.", e);
      setErrorMessage('Could not load Google Sign-In.');
    }
  };

  // Effect to initialize and render the Google Sign-In button
  // Listen for the 'load' event to ensure the GIS script is ready.
  useEffect(() => {
    // Check if the script is already loaded (e.g., if this component re-rendered)
    if (window.google?.accounts?.id?.initialize) {
      handleGoogleInit();
    } else {
      // Wait for the window to indicate the script has loaded
      window.addEventListener('load', handleGoogleInit);
    }
    
    // Cleanup the listener when the component unmounts
    return () => {
      window.removeEventListener('load', handleGoogleInit);
    };
  }, []);

  // --- Email/Password Form Logic ---
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    if (isSignUpMode) {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        // Handle sign-up errors
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
        // Handle sign-in errors
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
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 text-white">
      <main className="w-full max-w-sm flex-grow flex flex-col items-center justify-center">
        <header className="text-center mb-8">
          <div className="inline-block mb-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-full p-4 shadow-lg glow">
              <i className="fas fa-calendar-check text-3xl text-gradient"></i>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gradient">Punch.In Scholar Companion</h1>
          <p className="text-white/80">Sign in to continue</p>
        </header>

        <div className="login-card rounded-xl p-8 shadow-xl w-full">
          <h2 className="text-2xl font-bold text-center mb-6 text-white/90">Welcome</h2>
          <div id="google-signin-button-container"></div>
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="mx-4 text-white/60 text-sm">OR</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-white/80 text-sm mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-white/80 text-sm mb-2">Password</label>
              <input 
                type="password" 
                id="password" 
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={isSignUpMode ? 'form-field-visible mb-6' : 'form-field-hidden'}>
              <label htmlFor="confirm-password" className="block text-white/80 text-sm mb-2">Confirm Password</label>
              <input 
                type="password" 
                id="confirm-password" 
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50" 
                required={isSignUpMode}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all">
              {isSignUpMode ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <div className="text-red-400 text-sm text-center mt-4 min-h-[1.25rem]">{errorMessage}</div>
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              {isSignUpMode ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={toggleAuthMode} className="text-indigo-400 hover:text-indigo-300 bg-transparent border-none cursor-pointer">
                {isSignUpMode ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </main>
      <footer className="w-full text-center p-8 text-white/50 text-sm">
        <p>Copyright &copy; 2025 Aadithya Vimal</p>
        <p className="mt-2">Contact: <a href="mailto:aadithyavimal.work@gmail.com" className="hover:text-white/80 transition-colors">aadithyavimal.work@gmail.com</a></p>
      </footer>
    </div>
  );
};

export default LoginPage;