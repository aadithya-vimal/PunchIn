import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// !! IMPORTANT !!
// I have moved your keys to environment variables.
// Create a file named .env.local in your /react-app/ folder.
//
// Add your keys to that file like this:
// VITE_API_KEY="AIzaSy...your...key"
// VITE_AUTH_DOMAIN="your-project.firebaseapp.com"
// VITE_PROJECT_ID="your-project-id"
// VITE_STORAGE_BUCKET="your-project.appspot.com"
// VITE_MESSAGING_SENDER_ID="your-sender-id"
// VITE_APP_ID="your-app-id"
// VITE_MEASUREMENT_ID="G-YOUR-ID"
//
// Your original API key was exposed. Please delete it from your Google Cloud console.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need
export const auth = getAuth(app);
export const db = getFirestore(app);