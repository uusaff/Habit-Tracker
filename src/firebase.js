import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwUE8d0UMmj2XwNHhCiVxsYvd3blaLZzQ",
  authDomain: "tropical-habit-tracker.firebaseapp.com",
  projectId: "tropical-habit-tracker",
  storageBucket: "tropical-habit-tracker.firebasestorage.app",
  messagingSenderId: "655672918138",
  appId: "1:655672918138:web:93a588bfcce6882c213bc3",
  measurementId: "G-36F96NL94G"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();