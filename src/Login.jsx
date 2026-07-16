import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicBackground } from './App';
import { 
  Sun, Moon, ChevronDown, Activity, Target, Zap, 
  TrendingUp, BarChart3, Clock, CheckCircle, Shield, Award 
} from 'lucide-react';

// Reusable animation variants for smooth reveals
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function LoginScreen() {
  // Authentication State (Untouched)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  // Theme & Navigation State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  const loginRef = useRef(null);
  const featuresRef = useRef(null);

  // Theme effect matching App.jsx
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auth Handlers (Untouched)
  const handleAuth = async (e) => {
    e.preventDefault(); 
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
    <div className="min-h-screen relative font-sans text-stone-800 dark:text-slate-200 transition-colors duration-500 overflow-x-hidden selection:bg-teal-500/30">
      
      {/* Animated Background System Injected */}
      <CinematicBackground theme={theme} />

      {/* PREMIUM HEADER (Sticky) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl border-b border-white/60 dark:border-stone-700/60 shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}>
          <img
            src="https://res.cloudinary.com/dy1wk6svu/image/upload/f_auto,q_auto/bg_hou2cp"
            alt="usafs logo"
            className="h-8 sm:h-10 w-auto rounded-lg object-contain drop-shadow-sm"
          />
          <span className="font-bold text-stone-700 dark:text-stone-200 tracking-wide text-sm sm:text-base hidden sm:block">
            USAF's Habit Tracker
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/60 dark:bg-stone-800/60 border border-white/60 dark:border-stone-700/60 shadow-sm hover:shadow-md text-stone-700 dark:text-stone-300 transition-all hover:scale-105 active:scale-95"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => scrollToSection(loginRef)}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Get Started
          </button>

          <a
            href="https://github.com/uusaff"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors bg-white/60 dark:bg-stone-800/60 px-4 py-1.5 rounded-full border border-white/60 dark:border-stone-700/60 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
              <path d="M9 18c-4.5 1.6-5-2.5-5-3"></path>
            </svg>
            <span className="hidden sm:inline">uusaff</span>
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-stone-800/40 border border-white/60 dark:border-stone-700/60 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide uppercase">STATUS = LIVE</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-stone-800 to-stone-500 dark:from-white dark:to-stone-400 mb-6 leading-[1.1]">
            Design your future. <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-400">
              One habit at a time.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="max-w-2xl text-lg sm:text-xl text-stone-600 dark:text-stone-400 mb-10 leading-relaxed font-medium">
            A premium, frictionless environment to track your daily progress, visualize your streaks, and engineer the life you want.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <button 
              onClick={() => scrollToSection(loginRef)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-lg font-semibold shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              Start Your Journey
            </button>
            <button 
              onClick={() => scrollToSection(featuresRef)}
              className="px-8 py-4 rounded-2xl bg-white/50 dark:bg-stone-800/50 backdrop-blur-md border border-white/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-200 text-lg font-semibold hover:bg-white/80 dark:hover:bg-stone-700/80 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              Explore Features
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 cursor-pointer text-stone-400 hover:text-teal-500 transition-colors"
          onClick={() => scrollToSection(featuresRef)}
        >
          <span className="text-xs font-semibold tracking-widest uppercase">Scroll to discover</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURE GRID */}
      <section ref={featuresRef} className="py-24 sm:py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeInUp} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="p-8 rounded-3xl bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl shadow-teal-100/30 dark:shadow-black/20 group">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-3">Frictionless Logging</h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">Check in instantly with beautiful visual grids. Less time managing the app, more time doing the work.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeInUp} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="p-8 rounded-3xl bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl shadow-teal-100/30 dark:shadow-black/20 group">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-3">Unbreakable Streaks</h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">Harness the psychology of consistency. Watch your streaks grow and build momentum that refuses to stop.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeInUp} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="p-8 rounded-3xl bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl shadow-teal-100/30 dark:shadow-black/20 group">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-7 h-7 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-3">Deep Analytics</h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">Switch seamlessly between weekly grids and monthly overviews. Understand your true completion rates.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE (Bento Grid Style) */}
      <section className="py-20 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="rounded-[2.5rem] bg-gradient-to-br from-white/60 to-white/20 dark:from-stone-800/60 dark:to-stone-900/20 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl p-8 sm:p-16 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-bold text-stone-800 dark:text-white leading-tight">
                Designed for the <br/><span className="text-teal-500">obsessed.</span>
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-400">
                Whether you're writing code, lifting weights, or studying algorithms, track it all in a workspace that respects your focus. Export to CSV, print physical trackers, and own your data.
              </p>
              <ul className="space-y-4 pt-4">
                {['Light & Dark Mode', 'Cloud Sync across devices', 'Printable PDF tracking grids'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-stone-700 dark:text-stone-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-teal-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full flex justify-center perspective-1000">
              {/* Abstract App Representation */}
              <motion.div 
                whileHover={{ rotateY: -10, rotateX: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800"
              >
                <div className="h-12 border-b border-stone-100 dark:border-stone-800 flex items-center px-4 gap-2 bg-stone-50/50 dark:bg-stone-900/50">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 w-1/3 bg-stone-200 dark:bg-stone-800 rounded-full"></div>
                  <div className="space-y-3 pt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full"></div>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-6 h-6 rounded-md bg-teal-500"></div>
                          <div className="w-6 h-6 rounded-md bg-teal-500"></div>
                          <div className="w-6 h-6 rounded-md border-2 border-stone-200 dark:border-stone-700"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 relative z-10 flex flex-col items-center justify-center px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-400 to-emerald-400 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-200/50 dark:shadow-teal-900/50 mb-8 transform -rotate-12">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-stone-800 dark:text-white tracking-tight mb-6">
            Ready to Build Better Habits?
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 mb-10 font-medium">
            Thousands of small daily actions create extraordinary results. Your future self starts with today's decisions.
          </p>
          <button 
            onClick={() => scrollToSection(loginRef)}
            className="px-10 py-4 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-lg font-bold shadow-2xl hover:scale-105 hover:shadow-teal-500/30 transition-all duration-300"
          >
            Access the Tracker
          </button>
        </motion.div>
      </section>

      {/* ACTUAL LOGIN CARD (Bottom) */}
      <section ref={loginRef} className="pb-32 pt-20 relative z-10 flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl shadow-2xl shadow-teal-100/50 dark:shadow-black/50 p-8 sm:p-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-400 to-emerald-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-teal-200/60 mb-5 transform transition-transform hover:rotate-12 duration-300 cursor-default">
              🌴
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-white tracking-tight">
              {isLogin ? 'Welcome !' : 'Start Tracking.'}
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 font-medium">
              {isLogin ? 'Sign in to get started' : 'Create an account to get started'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 mb-6">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-stone-700 dark:text-stone-200 placeholder-stone-400"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-stone-700 dark:text-stone-200 placeholder-stone-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-lg py-4 rounded-2xl shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-stone-300 dark:border-stone-700 w-full"></div>
            <span className="bg-transparent px-4 text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 absolute backdrop-blur-md rounded-full">or</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold py-4 rounded-2xl shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-8 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-teal-600 dark:text-teal-400 font-bold hover:underline transition-all"
            >
              {isLogin ? 'Create one now' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-stone-200/50 dark:border-stone-700/50 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-semibold text-stone-400 tracking-wider uppercase">
        <p>© {new Date().getFullYear()} USAF's Tracker.</p>
        <p className="hidden sm:block">•</p>
        <p>Built for the obsessed.</p>
      </footer>
    </div>
  );
}