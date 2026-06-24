import { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email/Password Signup
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
    } catch (error) {
      console.error(error.message);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Logged in with Google!");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="p-10 space-y-4">
      <input 
        type="email" 
        placeholder="Email" 
        onChange={(e) => setEmail(e.target.value)} 
        className="block border p-2 rounded"
      />
      <input 
        type="password" 
        placeholder="Password" 
        onChange={(e) => setPassword(e.target.value)} 
        className="block border p-2 rounded"
      />
      
      <button onClick={handleSignUp} className="bg-teal-500 text-white px-4 py-2 rounded mr-2">
        Sign Up
      </button>
      
      <button onClick={handleGoogleLogin} className="bg-red-500 text-white px-4 py-2 rounded">
        Continue with Google
      </button>
    </div>
  );
}