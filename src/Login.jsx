import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup

  const handleAuth = async (e) => {
    e.preventDefault(); // Page refresh hone se roke ga
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-orange-50 to-amber-50 p-4 font-sans relative overflow-hidden">
      
      {/* Background Tropical Blur Circles */}
      <div className="absolute top-0 -left-24 w-72 h-72 bg-teal-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-orange-300/40 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-teal-100/50 p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-400 to-emerald-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-teal-200/60 mb-4">
            🌴
          </div>
          <h2 className="text-2xl font-bold text-stone-800">
            {isLogin ? 'Welcome Back!' : 'Start Tracking'}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {isLogin ? 'Sign in to sync your habits' : 'Create an account to get started'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 mb-6">
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/80 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-stone-700"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/80 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-stone-700"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-stone-300 w-full"></div>
          <span className="bg-transparent px-3 text-sm text-stone-400 absolute">or</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-stone-200 text-stone-700 font-medium py-3 rounded-xl shadow-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-stone-500 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-teal-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}