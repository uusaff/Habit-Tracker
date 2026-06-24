// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwUE8d0UMmj2XwNHhCiVxsYvd3blaLZzQ",
  authDomain: "tropical-habit-tracker.firebaseapp.com",
  projectId: "tropical-habit-tracker",
  storageBucket: "tropical-habit-tracker.firebasestorage.app",
  messagingSenderId: "655672918138",
  appId: "1:655672918138:web:93a588bfcce6882c213bc3",
  measurementId: "G-36F96NL94G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();