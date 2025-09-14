import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl26G3Iki090KsKYgS3uG4jDdTYU9bLjw",
  authDomain: "attendance-pro-76984.firebaseapp.com",
  projectId: "attendance-pro-76984",
  storageBucket: "attendance-pro-76984.appspot.com",
  messagingSenderId: "1061249192401",
  appId: "1:1061249192401:web:93a7db035a0e14bb2910f0",
  measurementId: "G-WPDEYXTNFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need
export const auth = getAuth(app);
export const db = getFirestore(app);