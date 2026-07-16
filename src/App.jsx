import React, { useState, useEffect, useRef, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginScreen from './Login';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
// Added LogOut, ChevronLeft to the imports
import {
  Footprints, BookOpen, Moon, Leaf, Dumbbell, Droplet, Brain, Heart,
  Music, Camera, Coffee, PenLine, Plus, Trash2, Check,
  Quote as QuoteIcon, Flame, TrendingUp, User, Calendar, Edit3, X,
  Award, Target, Sun, Printer, Download, Minus, Settings, BarChart2,
  Zap, Trophy, Sparkles, ChevronRight, ChevronLeft, Activity, LogOut
} from 'lucide-react';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const STORAGE_KEY = 'tropical-habit-tracker-v1';
const PROFILE_STORAGE_KEY = 'tropical-habit-tracker-profile-v1';

const ICONS = { Footprints, BookOpen, Moon, Leaf, Dumbbell, Droplet, Brain, Heart, Music, Camera, Coffee, PenLine, Activity, Zap };
const ICON_KEYS = Object.keys(ICONS);

const COLORS = {
  teal: { grad: 'from-teal-400 to-cyan-400', solid: 'bg-teal-500', light: 'bg-teal-50 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' },
  orange: { grad: 'from-orange-400 to-amber-400', solid: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  green: { grad: 'from-emerald-400 to-green-500', solid: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  sand: { grad: 'from-amber-300 to-yellow-400', solid: 'bg-amber-400', light: 'bg-amber-50 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  rose: { grad: 'from-rose-400 to-pink-400', solid: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
  sky: { grad: 'from-sky-400 to-blue-400', solid: 'bg-sky-500', light: 'bg-sky-50 dark:bg-sky-500/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
  purple: { grad: 'from-purple-400 to-indigo-400', solid: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
};
const COLOR_KEYS = Object.keys(COLORS);

const CATEGORIES = ['Morning', 'Anytime', 'Evening'];

const QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Aristotle" },
  { text: "Successful people are simply those with successful habits.", author: "Brian Tracy" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Chains of habit are too weak to be felt until they are too strong to be broken.", author: "Samuel Johnson" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "Small daily improvements lead to staggering long-term results.", author: "John C. Maxwell" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "Every action you take is a vote for the person you wish to become.", author: "James Clear" },
];

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Daily Steps', icon: 'Footprints', color: 'teal', category: 'Anytime' },
  { id: 'h2', name: 'Deep Work', icon: 'BookOpen', color: 'purple', category: 'Morning' },
  { id: 'h3', name: 'Sleep Tracking', icon: 'Moon', color: 'sky', category: 'Evening' },
  { id: 'h4', name: 'Hydration', icon: 'Droplet', color: 'sky', category: 'Anytime' },
];

const DEFAULT_DATA = { habits: DEFAULT_HABITS, checkins: {} };
const DEFAULT_PROFILE = { name: '', age: '', weight: '', height: '' };

const ACHIEVEMENTS = [
  { id: 'a1', title: 'Beginner', desc: 'Complete your first 10 habits', req: 10, icon: '🌟', color: 'sand' },
  { id: 'a2', title: 'Consistent', desc: 'Reach a 7-day streak', req: 7, isStreak: true, icon: '🔥', color: 'orange' },
  { id: 'a3', title: 'Discipline Master', desc: 'Reach a 30-day streak', req: 30, isStreak: true, icon: '👑', color: 'purple' },
  { id: 'a4', title: 'Fire Starter', desc: '100 total check-ins', req: 100, icon: '⚡', color: 'rose' },
  { id: 'a5', title: 'Habit Machine', desc: '500 total check-ins', req: 500, icon: '🤖', color: 'teal' },
];

// ============================================================================
// UTILITIES
// ============================================================================
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function getWeekDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });
}
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getMonthDates(year, month) {
  const total = daysInMonth(year, month);
  return Array.from({ length: total }, (_, i) => new Date(year, month, i + 1));
}
function getEntry(checkins, dKey, habitId) {
  const v = checkins[dKey]?.[habitId];
  if (!v) return { status: 'unchecked', note: '' };
  if (v === true) return { status: 'checked', note: '' };
  return { status: v.status || 'unchecked', note: v.note || '' };
}
function getLongestStreak(habitId, checkins) {
  const keys = Object.keys(checkins);
  if (keys.length === 0) return 0;
  const start = new Date(keys.sort()[0]);
  const end = new Date();
  let longest = 0, current = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const entry = getEntry(checkins, dateKey(d), habitId);
    if (entry.status === 'checked') {
      current++; longest = Math.max(longest, current);
    } else if (entry.status !== 'skipped') {
      current = 0;
    }
  }
  return longest;
}
function exportToCSV(habits, checkins) {
  const dates = Object.keys(checkins).sort();
  const headers = ['Date', ...habits.map((h) => h.name)];
  const rows = dates.map((dK) => {
    const row = [dK];
    habits.forEach((h) => {
      const entry = getEntry(checkins, dK, h.id);
      row.push(entry.status === 'unchecked' ? '' : entry.status);
    });
    return row;
  });
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `habit-tracker-${dateKey(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

const ScrollSection = ({ children, id, className = '' }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className={`w-full max-w-6xl mx-auto px-4 sm:px-8 py-12 ${className}`}
  >
    {children}
  </motion.section>
);

const GlassCard = ({ children, className = '', hover = true }) => (
  <div className={`bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ${hover ? 'rounded-3xl transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_rgb(0,0,0,0.4)] hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);

const AnimatedNumber = ({ value }) => {
  return <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={value}>{value}</motion.span>;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function HabitTracker() {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [viewMode, setViewMode] = useState('weekly');
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Nav Expansion State
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // Modals & Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Habit Form State
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Footprints');
  const [newColor, setNewColor] = useState('teal');
  const [newCategory, setNewCategory] = useState('Anytime');

  // Profile Form State
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState('');
  const [pWeight, setPWeight] = useState('');
  const [pHeight, setPHeight] = useState('');

  // Print State
  const [selectedPrintMonth, setSelectedPrintMonth] = useState(() => new Date().getMonth());
  const [printMonth, setPrintMonth] = useState(() => new Date().getMonth());
  const [printYear, setPrintYear] = useState(() => new Date().getFullYear());

  const { scrollYProgress } = useScroll();

  // Authentication & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const dbData = docSnap.data();
        setData({
          habits: Array.isArray(dbData.trackerData?.habits) ? dbData.trackerData.habits : DEFAULT_DATA.habits,
          checkins: typeof dbData.trackerData?.checkins === "object" ? dbData.trackerData.checkins : {},
        });
        setProfile(dbData.profileData || DEFAULT_PROFILE);
      } else {
        setData(DEFAULT_DATA);
        setProfile(DEFAULT_PROFILE);
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user || !data || !profile) return;
    const saveUserData = async () => {
      await setDoc(doc(db, 'users', user.uid), { trackerData: data, profileData: profile }, { merge: true });
    };
    saveUserData();
  }, [data, profile, user]);

  // Handle Theme Toggle
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => setQuoteIndex((i) => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(interval);
  }, []);

  // Time & Greeting
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 18) greeting = 'Good Afternoon';

  // Memoized Dates & Logic
  const weekDates = useMemo(() => getWeekDates(), []);
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthDates = useMemo(() => getMonthDates(year, month), [year, month]);
  const daysElapsed = today.getDate();

  const habits = data?.habits || [];
  const checkins = data?.checkins || {};

  const getStreak = (habitId) => {
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const entry = getEntry(checkins, dateKey(cursor), habitId);
      if (entry.status === 'checked') { streak++; cursor.setDate(cursor.getDate() - 1); }
      else if (entry.status === 'skipped') { cursor.setDate(cursor.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const currentStreak = useMemo(() => habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0), [habits, checkins]);
  const bestStreakEver = useMemo(() => habits.reduce((max, h) => Math.max(max, getLongestStreak(h.id, checkins)), 0), [habits, checkins]);
  const totalCheckins = useMemo(() => habits.reduce((acc, h) => acc + Object.keys(checkins).filter(k => getEntry(checkins, k, h.id).status === 'checked').length, 0), [checkins, habits]);
  
  // XP & Level System
  const totalXP = totalCheckins * 10;
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpToNext = 100 - (totalXP % 100);
  const xpProgress = (totalXP % 100);

  const monthlyCompleted = useMemo(() => {
    let count = 0;
    monthDates.forEach((d) => {
      if (d > today) return;
      habits.forEach((h) => { if (getEntry(checkins, dateKey(d), h.id).status === 'checked') count++; });
    });
    return count;
  }, [monthDates, habits, checkins, today]);

  const habitMonthlyCount = (habitId) => {
    return monthDates.filter(d => d <= today && getEntry(checkins, dateKey(d), habitId).status === 'checked').length;
  };

  const todayChecked = habits.filter((h) => getEntry(checkins, todayKey, h.id).status === 'checked').length;
  const totalHabits = habits.length;
  const pct = totalHabits === 0 ? 0 : Math.round((todayChecked / totalHabits) * 100);
  const monthlyTotalPossible = habits.length * daysElapsed;
  const monthlyRate = monthlyTotalPossible === 0 ? 0 : Math.round((monthlyCompleted / monthlyTotalPossible) * 100);

  const bestHabit = useMemo(() => {
    if (habits.length === 0) return null;
    let best = habits[0], bestCount = habitMonthlyCount(best.id);
    habits.forEach((h) => {
      const c = habitMonthlyCount(h.id);
      if (c > bestCount) { best = h; bestCount = c; }
    });
    return bestCount > 0 ? best : null;
  }, [habits, checkins, monthDates]);

  // Analytics Chart Data Preparation
  const weeklyData = weekDates.map(d => {
    const k = dateKey(d);
    return {
      day: dayNamesShort[d.getDay()],
      count: habits.filter(h => getEntry(checkins, k, h.id).status === 'checked').length
    };
  });
  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);

  // AI Insights generation
  const insights = useMemo(() => {
    const res = [];
    if (currentStreak > 3) res.push(`You're on fire! A ${currentStreak}-day streak is incredible. Keep the momentum going.`);
    if (bestHabit) res.push(`${bestHabit.name} is your strongest habit this month. You're building solid discipline here.`);
    if (pct === 100) res.push(`Perfect day today. You've completed 100% of your targets. Your future self is thanking you.`);
    else if (pct > 50) res.push(`Good progress today. Just a little more effort to hit a perfect score.`);
    else res.push(`Every day is a fresh start. Focus on knocking out just one habit right now.`);
    return res;
  }, [currentStreak, bestHabit, pct]);

  // Actions
  const toggleCheckin = (habitId, dKey) => {
    setData((prev) => {
      const day = prev.checkins[dKey] || {};
      const current = getEntry(prev.checkins, dKey, habitId);
      const nextStatus = current.status === 'checked' ? 'skipped' : current.status === 'skipped' ? 'unchecked' : 'checked';
      return { ...prev, checkins: { ...prev.checkins, [dKey]: { ...day, [habitId]: { status: nextStatus, note: current.note } } } };
    });
  };

  const setCheckinNote = (habitId, dKey) => {
    const current = getEntry(data.checkins, dKey, habitId);
    const note = window.prompt('Note for this check-in:', current.note || '');
    if (note === null) return;
    setData((prev) => {
      const day = prev.checkins[dKey] || {};
      const existing = getEntry(prev.checkins, dKey, habitId);
      return { ...prev, checkins: { ...prev.checkins, [dKey]: { ...day, [habitId]: { ...existing, note: note.trim() } } } };
    });
  };

  const saveHabit = () => {
    if (!newName.trim()) return;
    if (editingHabitId) {
      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((h) => h.id === editingHabitId ? { ...h, name: newName.trim(), icon: newIcon, color: newColor, category: newCategory } : h),
      }));
    } else {
      setData((prev) => ({
        ...prev,
        habits: [...prev.habits, { id: "h" + Date.now(), name: newName.trim(), icon: newIcon, color: newColor, category: newCategory }],
      }));
    }
    cancelForm();
  };

  const cancelForm = () => {
    setNewName(""); setNewIcon("Footprints"); setNewColor("teal"); setNewCategory("Anytime"); setEditingHabitId(null); setShowAddForm(false);
  };

  const deleteHabit = (id) => setData((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== id) }));

  // Navigation Links
  const navLinks = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'habits', icon: Check, label: 'Habits' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'achievements', icon: Trophy, label: 'Awards' },
  ];

  if (!user) return <LoginScreen />;
  if (user.email === 'uussaff@gmail.com') return <AdminDashboard handleSignOut={() => signOut(auth)} />;
  if (!data || !profile) return <LoadingScreen theme={theme} />;

  return (
    <>
      <div className="print:hidden relative min-h-screen font-sans text-slate-800 dark:text-slate-200 selection:bg-teal-500/30 overflow-x-hidden">
        <CinematicBackground theme={theme} />

        {/* Floating Expandable Sidebar / Mobile Bottom Nav */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:top-1/2 md:-translate-y-1/2 md:left-6 md:bottom-auto z-50 flex items-center md:items-start group">
          <GlassCard
            className={`flex p-2 gap-2 rounded-[2rem] border-white/40 dark:border-white/10 transition-all duration-300 overflow-hidden ${
              isNavExpanded
                ? 'flex-col w-[200px] items-start' // Expanded State
                : 'flex-row w-auto md:flex-col md:w-[68px] md:hover:w-[200px] md:items-start items-center' // Collapsed State
            }`}
            hover={false}
          >
            {/* Theme Toggle Button at the top/front */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-full md:rounded-2xl text-amber-500 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-all flex items-center shrink-0 w-full outline-none"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0 mx-auto md:mx-0" /> : <Moon className="w-5 h-5 shrink-0 mx-auto md:mx-0" />}
              <span className={`whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ${isNavExpanded ? 'ml-3 opacity-100 w-auto' : 'w-0 md:group-hover:opacity-100 md:group-hover:ml-3 md:group-hover:w-auto hidden md:block'}`}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Divider */}
            <div className={`bg-stone-200 dark:bg-stone-700 shrink-0 ${isNavExpanded ? 'w-full h-px my-1' : 'w-px h-6 mx-1 md:w-full md:h-px md:my-1 md:mx-0'}`} />

            {/* Nav Links */}
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setIsNavExpanded(false)}
                className="p-3 rounded-full md:rounded-2xl text-stone-500 hover:text-teal-600 dark:text-stone-400 dark:hover:text-teal-400 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-all flex items-center shrink-0 w-full outline-none"
              >
                <link.icon className="w-5 h-5 shrink-0 mx-auto md:mx-0" />
                <span className={`whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ${isNavExpanded ? 'ml-3 opacity-100 w-auto' : 'w-0 md:group-hover:opacity-100 md:group-hover:ml-3 md:group-hover:w-auto hidden md:block'}`}>
                  {link.label}
                </span>
              </a>
            ))}

            {/* Divider */}
            <div className={`bg-stone-200 dark:bg-stone-700 shrink-0 ${isNavExpanded ? 'w-full h-px my-1' : 'w-px h-6 mx-1 md:w-full md:h-px md:my-1 md:mx-0'}`} />

            {/* Settings */}
            <button
              onClick={() => { setShowSettings(true); setIsNavExpanded(false); }}
              className="p-3 rounded-full md:rounded-2xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white transition-all flex items-center shrink-0 w-full outline-none"
            >
              <Settings className="w-5 h-5 shrink-0 mx-auto md:mx-0" />
              <span className={`whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ${isNavExpanded ? 'ml-3 opacity-100 w-auto' : 'w-0 md:group-hover:opacity-100 md:group-hover:ml-3 md:group-hover:w-auto hidden md:block'}`}>
                Settings
              </span>
            </button>

            {/* Log Out (Only shows horizontally if expanded on Mobile, or automatically on Desktop) */}
            <button
              onClick={() => signOut(auth)}
              className={`p-3 rounded-full md:rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all items-center shrink-0 w-full outline-none ${isNavExpanded ? 'flex' : 'hidden md:flex'}`}
            >
              <LogOut className="w-5 h-5 shrink-0 mx-auto md:mx-0" />
              <span className={`whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ${isNavExpanded ? 'ml-3 opacity-100 w-auto' : 'w-0 md:group-hover:opacity-100 md:group-hover:ml-3 md:group-hover:w-auto hidden md:block'}`}>
                Log Out
              </span>
            </button>

            {/* Mobile Arrow Button to expand/collapse (Visible only on Mobile) */}
            <button
              onClick={() => setIsNavExpanded(!isNavExpanded)}
              className={`md:hidden p-3 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors shrink-0 w-full flex justify-center outline-none`}
            >
              {isNavExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </GlassCard>
        </nav>

        {/* Main Content Wrapper */}
        <main className="md:ml-24 pb-32 pt-10">
          
          {/* Top Header */}
          <header className="max-w-6xl mx-auto px-4 sm:px-8 mb-12 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-[1px]">
                <div className="w-full h-full bg-white/20 dark:bg-black/20 rounded-2xl backdrop-blur flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight hidden sm:block">Aura Tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {profile.name ? profile.name[0].toUpperCase() : <User className="w-3 h-3" />}
                </div>
                <span className="font-semibold text-sm hidden sm:block">{profile.name || 'Setup Profile'}</span>
              </button>
            </div>
          </header>

          {/* 1. HERO SECTION */}
          <ScrollSection id="dashboard" className="pt-0">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1 space-y-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 dark:bg-slate-800/50 border border-white/50 dark:border-white/10 backdrop-blur-md shadow-sm">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-medium">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </motion.div>
                
                <div>
                  <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
                    {greeting}, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-500">{profile.name?.split(' ')[0] || 'Explorer'}</span>.
                  </h1>
                  <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-400 mt-4 max-w-xl leading-relaxed">
                    You have <strong className="text-stone-800 dark:text-stone-200">{totalHabits - todayChecked} habits</strong> remaining today. Keep building the life you want.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => document.getElementById('habits').scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                    Start Check-ins <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Ring Hero */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-sky-500/20 rounded-full blur-3xl animate-pulse" />
                <GlassCard className="absolute inset-4 rounded-full flex flex-col items-center justify-center z-10 border-white/80 dark:border-white/20">
                  <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 132 132">
                    <circle cx="66" cy="66" r="54" fill="none" stroke="currentColor" className="text-stone-200 dark:text-stone-800" strokeWidth="6" />
                    <motion.circle
                      cx="66" cy="66" r="54" fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={339.29}
                      initial={{ strokeDashoffset: 339.29 }}
                      animate={{ strokeDashoffset: 339.29 - (pct / 100) * 339.29 }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-center relative z-20">
                    <span className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-stone-800 to-stone-500 dark:from-white dark:to-stone-400">
                      <AnimatedNumber value={pct} />%
                    </span>
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-widest">Today's Goal</p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </ScrollSection>

          {/* 2. QUICK ACTIONS & LEVEL SYSTEM */}
          <ScrollSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level Card */}
              <GlassCard className="col-span-1 md:col-span-2 p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Current Level</p>
                      <h3 className="text-2xl font-bold">Level {currentLevel}</h3>
                    </div>
                    <p className="text-sm font-medium text-stone-500">{xpToNext} XP to next</p>
                  </div>
                  <div className="h-3 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${xpProgress}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500" />
                  </div>
                </div>
              </GlassCard>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowAddForm(true)} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Plus className="w-6 h-6 text-teal-500" />
                  <span className="text-sm font-semibold">Add Habit</span>
                </button>
                <button onClick={() => setShowPrintModal(true)} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Printer className="w-6 h-6 text-stone-500 dark:text-stone-400" />
                  <span className="text-sm font-semibold">Print</span>
                </button>
              </div>
            </div>
          </ScrollSection>

          {/* 3. PREMIUM STATISTICS */}
          <ScrollSection>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity className="w-6 h-6 text-orange-500" /> Performance Metrics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard icon={Check} label="Total Check-ins" value={totalCheckins} sub="Lifetime" color="teal" />
              <StatCard icon={Flame} label="Current Streak" value={`${currentStreak}d`} sub="Keep going!" color="orange" />
              <StatCard icon={Award} label="Best Streak" value={`${bestStreakEver}d`} sub="All-time record" color="purple" />
              <StatCard icon={Target} label="Monthly Rate" value={`${monthlyRate}%`} sub={`${monthlyCompleted} completions`} color="sky" />
            </div>
          </ScrollSection>

          {/* 4. HABITS TRACKER (WEEKLY/MONTHLY) */}
          <ScrollSection id="habits">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold tracking-tight">Your Habits</h2>
              <div className="flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1 rounded-full border border-white/60 dark:border-white/10">
                <button onClick={() => setViewMode('weekly')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'weekly' ? 'bg-white dark:bg-stone-800 shadow-sm text-teal-600 dark:text-teal-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}>Weekly</button>
                <button onClick={() => setViewMode('monthly')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-white dark:bg-stone-800 shadow-sm text-teal-600 dark:text-teal-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}>Monthly</button>
              </div>
            </div>

            <GlassCard className="p-2 sm:p-6">
              {viewMode === 'weekly' && (
                <div className="space-y-8">
                  {/* Weekly Header */}
                  <div className="flex items-center mb-2 px-2">
                    <div className="w-32 sm:w-48 shrink-0" />
                    {weekDates.map((d, i) => {
                      const isToday = dateKey(d) === todayKey;
                      return (
                        <div key={i} className="flex-1 text-center">
                          <div className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400 dark:text-stone-500'}`}>{dayNamesShort[d.getDay()]}</div>
                          <div className={`text-lg mt-1 font-medium ${isToday ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 w-8 h-8 mx-auto rounded-full flex items-center justify-center' : 'text-stone-500 dark:text-stone-400'}`}>{d.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>

                  {CATEGORIES.map(cat => {
                    const catHabits = habits.filter(h => (h.category || 'Anytime') === cat);
                    if (catHabits.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-4">{cat}</p>
                        {catHabits.map(habit => {
                          const Icon = ICONS[habit.icon] || Footprints;
                          const color = COLORS[habit.color] || COLORS.teal;
                          const streak = getStreak(habit.id);
                          return (
                            <motion.div layout key={habit.id} className="flex items-center bg-white/60 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 rounded-2xl p-3 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700 group shadow-sm">
                              <div className="w-32 sm:w-48 shrink-0 flex items-center gap-3 pr-2">
                                <div className={`w-10 h-10 rounded-xl ${color.light} flex items-center justify-center shrink-0`}>
                                  <Icon className={`w-5 h-5 ${color.text}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">{habit.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {streak > 0 && <span className="text-[10px] font-semibold text-orange-500 flex items-center gap-0.5 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3"/> {streak}</span>}
                                  </div>
                                </div>
                                <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1">
                                  <button onClick={() => { setEditingHabitId(habit.id); setNewName(habit.name); setNewIcon(habit.icon); setNewColor(habit.color); setNewCategory(habit.category || 'Anytime'); setShowAddForm(true); }} className="p-1.5 text-stone-400 hover:text-teal-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"><Edit3 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => deleteHabit(habit.id)} className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>

                              {weekDates.map((d, i) => {
                                const k = dateKey(d);
                                const entry = getEntry(checkins, k, habit.id);
                                return (
                                  <div key={i} className="flex-1 flex justify-center relative">
                                    <PremiumCheckinCell status={entry.status} note={entry.note} color={color} isFuture={k > todayKey} isLocked={k !== todayKey} onToggle={() => toggleCheckin(habit.id, k)} onNote={() => setCheckinNote(habit.id, k)} />
                                  </div>
                                );
                              })}
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Monthly View (Compact Matrix) */}
              {viewMode === 'monthly' && (
                 <div className="overflow-x-auto pb-4">
                  <div className="min-w-max">
                    <div className="flex mb-4">
                      <div className="w-40 shrink-0" />
                      {monthDates.map(d => (
                        <div key={d.getDate()} className={`w-7 text-center text-[10px] font-bold ${dateKey(d) === todayKey ? 'text-teal-500' : 'text-stone-400'}`}>{d.getDate()}</div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {habits.map(habit => {
                        const Icon = ICONS[habit.icon] || Footprints;
                        const color = COLORS[habit.color] || COLORS.teal;
                        return (
                          <div key={habit.id} className="flex items-center hover:bg-white/50 dark:hover:bg-stone-800/50 p-1 rounded-xl transition-colors">
                            <div className="w-40 shrink-0 flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${color.text}`} />
                              <span className="text-xs font-semibold truncate">{habit.name}</span>
                            </div>
                            {monthDates.map(d => {
                              const k = dateKey(d);
                              const entry = getEntry(checkins, k, habit.id);
                              return (
                                <div key={k} className="w-7 flex justify-center">
                                  <button onClick={() => { if(k <= todayKey) toggleCheckin(habit.id, k); }} disabled={k > todayKey} className={`w-5 h-5 rounded-md border transition-all ${k > todayKey ? 'border-transparent bg-stone-100/50 dark:bg-stone-800/30' : entry.status === 'checked' ? `${color.solid} border-transparent scale-110 shadow-sm` : entry.status === 'skipped' ? 'border-dashed border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-800' : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 hover:border-stone-400'}`} />
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                 </div>
              )}
            </GlassCard>
          </ScrollSection>

          {/* 5. ANALYTICS DASHBOARD */}
          <ScrollSection id="analytics">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BarChart2 className="w-6 h-6 text-sky-500" /> Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Bar Chart */}
              <GlassCard className="p-6 h-80 flex flex-col">
                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6">This Week's Activity</h3>
                <div className="flex-1 flex items-end justify-between gap-2 px-2">
                  {weeklyData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-full group relative">
                      <div className="absolute -top-8 bg-stone-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{d.count}</div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-t-xl overflow-hidden relative flex items-end justify-center" style={{ height: '180px' }}>
                         <motion.div initial={{ height: 0 }} whileInView={{ height: `${maxWeeklyCount > 0 ? (d.count / maxWeeklyCount) * 100 : 0}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="w-full bg-gradient-to-t from-teal-500 to-sky-400 rounded-t-xl" />
                      </div>
                      <span className="text-xs font-semibold text-stone-500">{d.day}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Insights Component */}
              <GlassCard className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500"/> AI Insights</h3>
                  <div className="space-y-4">
                    {insights.map((insight, idx) => (
                      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.2 }} key={idx} className="flex gap-3 items-start bg-white/50 dark:bg-stone-800/50 p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mt-1.5 shrink-0" />
                        <p className="text-sm text-stone-700 dark:text-stone-300 font-medium leading-relaxed">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </ScrollSection>

          {/* 6. ACHIEVEMENTS */}
          <ScrollSection id="achievements">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" /> Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {ACHIEVEMENTS.map(ach => {
                const isUnlocked = ach.isStreak ? bestStreakEver >= ach.req : totalCheckins >= ach.req;
                const progress = ach.isStreak ? bestStreakEver : totalCheckins;
                const pct = Math.min((progress / ach.req) * 100, 100);
                const color = COLORS[ach.color];

                return (
                  <GlassCard key={ach.id} hover={false} className={`p-5 relative overflow-hidden flex flex-col items-center text-center transition-all duration-500 ${isUnlocked ? 'border-yellow-300/50 dark:border-yellow-500/30' : 'opacity-70 grayscale-[0.5]'}`}>
                    {isUnlocked && <div className={`absolute inset-0 bg-gradient-to-br ${color.grad} opacity-[0.05]`} />}
                    <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center text-3xl shadow-inner relative z-10 ${isUnlocked ? color.light : 'bg-stone-100 dark:bg-stone-800'}`}>
                      {ach.icon}
                    </div>
                    <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-stone-900 dark:text-white' : 'text-stone-500'}`}>{ach.title}</h4>
                    <p className="text-[10px] text-stone-500 font-medium mb-4 h-8">{ach.desc}</p>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mt-auto">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} className={`h-full ${isUnlocked ? color.solid : 'bg-stone-400'}`} />
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </ScrollSection>

          {/* MOTIVATIONAL QUOTE */}
          <ScrollSection>
             <GlassCard className="max-w-3xl mx-auto p-8 sm:p-12 text-center relative overflow-hidden border-t-4 border-t-teal-500">
               <QuoteIcon className="w-12 h-12 text-teal-500/20 absolute top-4 left-4" />
               <AnimatePresence mode="wait">
                  <motion.div key={quoteIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
                    <p className="text-xl sm:text-2xl font-serif text-stone-800 dark:text-stone-200 italic leading-relaxed mb-6">"{QUOTES[quoteIndex].text}"</p>
                    <p className="font-bold text-sm uppercase tracking-widest text-teal-600 dark:text-teal-400">— {QUOTES[quoteIndex].author}</p>
                  </motion.div>
               </AnimatePresence>
             </GlassCard>
          </ScrollSection>

          {/* FOOTER */}
          <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-medium text-stone-500">
            <div className="flex items-center gap-2">
              <img src="https://res.cloudinary.com/dy1wk6svu/image/upload/f_auto,q_auto/bg_hou2cp" alt="logo" className="w-6 h-6 rounded object-contain grayscale opacity-60" />
              <span>© {new Date().getFullYear()} M Yousaf</span>
            </div>
            <p className="flex items-center gap-1">Made with <Heart className="w-4 h-4 text-rose-500" /> & Discipline</p>
            <div className="flex gap-4 items-center">
              <a href="https://github.com/uusaff" target="_blank" rel="noopener noreferrer" className="hover:text-stone-800 dark:hover:text-white transition-colors">GitHub</a>
              <button onClick={() => exportToCSV(habits, checkins)} className="hover:text-stone-800 dark:hover:text-white transition-colors">Export Data</button>
              
              {/* Added Logout Button to Footer */}
              <div className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700 hidden sm:block" />
              <button 
                onClick={() => signOut(auth)} 
                className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold transition-colors flex items-center gap-1"
              >
                Log Out
              </button>
            </div>
          </footer>

        </main>

        {/* =======================================================================
            MODALS & OVERLAYS 
            ======================================================================= */}
        
        {/* Settings Modal (Simplified since Theme is moved to nav) */}
        <AnimatePresence>
          {showSettings && (
            <ModalOverlay onClose={() => setShowSettings(false)}>
              <div className="p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5"/> Account Settings</h3>
                <div className="space-y-6">
                  <div className="pt-2">
                    <button onClick={() => { signOut(auth); setShowSettings(false); }} className="w-full py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out from Device
                    </button>
                  </div>
                </div>
              </div>
            </ModalOverlay>
          )}
        </AnimatePresence>

        {/* Add/Edit Habit Modal */}
        <AnimatePresence>
          {showAddForm && (
            <ModalOverlay onClose={cancelForm}>
              <div className="p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">{editingHabitId ? 'Edit Habit' : 'New Habit'}</h3>
                <div className="space-y-4">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="E.g. Read 10 pages" className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-teal-500 outline-none text-stone-800 dark:text-white font-medium placeholder:text-stone-400" />
                  
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-2 block uppercase tracking-wider">Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_KEYS.map((key) => {
                        const Icon = ICONS[key];
                        return (
                          <button key={key} onClick={() => setNewIcon(key)} className={`p-3 rounded-xl border transition-all ${newIcon === key ? 'bg-teal-500 border-teal-500 text-white shadow-md scale-105' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:border-stone-300'}`}>
                            <Icon className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-2 block uppercase tracking-wider">Color</label>
                    <div className="flex gap-3">
                      {COLOR_KEYS.map((key) => (
                        <button key={key} onClick={() => setNewColor(key)} className={`w-8 h-8 rounded-full bg-gradient-to-br ${COLORS[key].grad} transition-all ${newColor === key ? 'ring-4 ring-offset-2 dark:ring-offset-stone-900 ring-teal-500 scale-110' : 'hover:scale-110'}`} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-2 block uppercase tracking-wider">Time of Day</label>
                    <div className="flex gap-2">
                      {CATEGORIES.map((cat) => (
                        <button key={cat} onClick={() => setNewCategory(cat)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${newCategory === cat ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-transparent shadow' : 'bg-white dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-stone-200 dark:border-stone-800">
                    <button onClick={cancelForm} className="px-5 py-2.5 rounded-xl font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">Cancel</button>
                    <button onClick={saveHabit} className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all">Save Habit</button>
                  </div>
                </div>
              </div>
            </ModalOverlay>
          )}
        </AnimatePresence>

        {/* Profile Modal */}
        <AnimatePresence>
          {showProfileForm && (
            <ModalOverlay onClose={() => setShowProfileForm(false)}>
              <div className="p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-6">Your Profile</h3>
                <div className="space-y-4">
                  <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none" />
                  <div className="grid grid-cols-2 gap-4">
                     <input type="number" value={pAge} onChange={(e) => setPAge(e.target.value)} placeholder="Age" className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none" />
                     <input type="number" value={pWeight} onChange={(e) => setPWeight(e.target.value)} placeholder="Weight (kg)" className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none" />
                  </div>
                  <button onClick={() => { setProfile({ name: pName.trim(), age: pAge, weight: pWeight, height: pHeight }); setShowProfileForm(false); }} className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold mt-4">Save Changes</button>
                </div>
              </div>
            </ModalOverlay>
          )}
        </AnimatePresence>

        {/* Print Modal */}
        <AnimatePresence>
          {showPrintModal && (
            <ModalOverlay onClose={() => setShowPrintModal(false)}>
              <div className="p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Printer className="w-5 h-5"/> Print Journal</h3>
                <p className="text-sm text-stone-500 mb-6">Generate a beautiful PDF or physical sheet to track manually.</p>
                <select value={selectedPrintMonth} onChange={(e) => setSelectedPrintMonth(parseInt(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none mb-6 font-semibold">
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 text-stone-500 font-semibold">Cancel</button>
                  <button onClick={() => { setPrintMonth(selectedPrintMonth); setShowPrintModal(false); setTimeout(() => window.print(), 150); }} className="px-6 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold">Print Now</button>
                </div>
              </div>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden Print View */}
      <PrintView habits={habits} year={printYear} month={printMonth} />
    </>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard = ({ icon: Icon, label, value, sub, color }) => {
  const c = COLORS[color];
  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full" hover={true}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${c.light} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight">{value}</h4>
        <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mt-1">{label}</p>
        {sub && <p className="text-xs text-stone-400 font-medium mt-1">{sub}</p>}
      </div>
    </GlassCard>
  );
};

const PremiumCheckinCell = ({ status, note, color, isFuture, isLocked, onToggle, onNote }) => {
  const [showXp, setShowXp] = useState(false);
  const timerRef = useRef(null);
  const disabled = isFuture || isLocked;

  const handleToggle = () => {
    if (disabled) return;
    if (status !== 'checked') {
      setShowXp(true);
      setTimeout(() => setShowXp(false), 1200);
    }
    onToggle();
  };

  const start = () => { if (!disabled) timerRef.current = setTimeout(() => onNote(), 500); };
  const cancel = () => clearTimeout(timerRef.current);

  let visual = 'bg-stone-100 dark:bg-stone-800 border-transparent text-transparent';
  if (!disabled) visual = 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-stone-400 hover:shadow-sm cursor-pointer';
  if (status === 'checked') visual = `${color.solid} text-white shadow-inner scale-[1.05] shadow-${color.solid.split('-')[1]}-500/50`;
  else if (status === 'skipped') visual = 'border-2 border-dashed border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/50 text-stone-400';
  else if (isFuture) visual = 'bg-transparent border-none opacity-20';

  return (
    <div className="relative">
      <AnimatePresence>
        {showXp && (
           <motion.div initial={{ opacity: 1, y: 0, scale: 0.5 }} animate={{ opacity: 0, y: -30, scale: 1.2 }} exit={{ opacity: 0 }} className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-black text-amber-500 drop-shadow-md z-50 whitespace-nowrap pointer-events-none">
             +10 XP
           </motion.div>
        )}
      </AnimatePresence>
      <button
        disabled={disabled} onClick={handleToggle} onContextMenu={(e) => { e.preventDefault(); if(!disabled) onNote(); }}
        onMouseDown={start} onMouseUp={cancel} onMouseLeave={cancel} onTouchStart={start} onTouchEnd={cancel}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[20px] flex items-center justify-center transition-all duration-300 border-2 ${visual} focus:outline-none focus:ring-4 focus:ring-${color.solid.split('-')[1]}-500/30`}
      >
        {status === 'checked' && <motion.div initial={{scale:0}} animate={{scale:1}}><Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} /></motion.div>}
        {status === 'skipped' && <Minus className="w-4 h-4" strokeWidth={3} />}
        {note && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-stone-800" />}
      </button>
    </div>
  );
};

const ModalOverlay = ({ children, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl rounded-3xl overflow-hidden relative">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-white transition-colors"><X className="w-4 h-4"/></button>
      {children}
    </motion.div>
  </motion.div>
);

const LoadingScreen = ({ theme }) => (
  <div className="min-h-screen flex items-center justify-center">
    <CinematicBackground theme={theme} />
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full z-10" />
  </div>
);

// ============================================================================
// CINEMATIC BACKGROUND (ENHANCED)
// ============================================================================

export const CinematicBackground = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-stone-50 dark:bg-stone-950 transition-colors duration-1000">
      {/* Dynamic Gradients */}
      <motion.div animate={{ opacity: isDark ? 0 : 1 }} transition={{ duration: 2 }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200 via-stone-50 to-stone-100" />
      <motion.div animate={{ opacity: isDark ? 1 : 0 }} transition={{ duration: 2 }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-stone-950 to-stone-950" />
      
      {/* Ambient Orbs */}
      <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/10 dark:bg-teal-900/20 blur-[120px]" />
      <motion.div animate={{ x: [0, -40, 0], y: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-400/10 dark:bg-purple-900/20 blur-[100px]" />

      {/* Stars for Dark Mode */}
      <AnimatePresence>
        {isDark && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute inset-0">
            {[...Array(60)].map((_, i) => (
              <motion.div key={i} className="absolute bg-white rounded-full" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px` }} animate={{ opacity: [0.1, Math.random() * 0.8 + 0.2, 0.1] }} transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mesh Pattern Overlay for Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTUwLCAxNTAsIDE1MCwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent_80%)]" />
    </div>
  );
};

// ============================================================================
// ADMIN AND PRINT VIEWS 
// ============================================================================

function AdminDashboard({ handleSignOut }) {
  const [allUsers, setAllUsers] = React.useState([]);
  React.useEffect(() => {
    const fetchAllData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = [];
        querySnapshot.forEach((doc) => usersData.push({ id: doc.id, ...doc.data() }));
        setAllUsers(usersData);
      } catch (error) { console.error("Error:", error); }
    };
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Admin Console</h1>
          <button onClick={handleSignOut} className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold">Exit</button>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
          <h2 className="text-xl font-bold text-stone-500 uppercase tracking-widest mb-6">Total Users: {allUsers.length}</h2>
          <div className="space-y-2">
            {allUsers.map((u, i) => (
              <div key={u.id} className="p-4 bg-stone-50 rounded-2xl flex justify-between items-center border border-stone-100">
                <span className="font-bold text-stone-800">{u.profileData?.name || `User ${i + 1}`} <span className="text-stone-400 font-normal ml-2 text-sm">{u.id}</span></span>
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-bold">{u.trackerData?.habits?.length || 0} Habits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintView({ habits, year, month }) {
  const dates = getMonthDates(year, month);
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
  const blankColumnsCount = Math.max(0, 7 - habits.length);
  const blankColumns = Array.from({ length: blankColumnsCount });

  return (
    <div className="hidden print:block text-black bg-white" style={{ margin: 0, padding: 0 }}>
      <style>{`@media print { @page { size: A4 portrait; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: ui-sans-serif, system-ui; } table { table-layout: fixed; width: 100%; border-collapse: collapse; } th, td { border: 1.5px solid #000; } }`}</style>
      <div className="flex justify-between items-end mb-6 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Habit Tracker</h1>
          <h2 className="text-xl font-bold text-gray-600 mt-2 tracking-widest uppercase">{monthName} {year}</h2>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-3 text-center font-bold text-xs w-16 uppercase tracking-wider">Date</th>
            {habits.map(h => <th key={h.id} className="px-2 py-3 text-center font-bold text-xs uppercase tracking-wider">{h.name}</th>)}
            {blankColumns.map((_, i) => <th key={`bh-${i}`} className="px-2 py-3"></th>)}
          </tr>
        </thead>
        <tbody>
          {dates.map((d) => (
            <tr key={d.getDate()} className={d.getDay() === 0 || d.getDay() === 6 ? "bg-gray-50" : ""}>
              <td className="px-2 py-2 text-center h-8">
                <span className="font-bold">{pad(d.getDate())}</span>
                <span className="text-gray-500 text-[9px] ml-1 uppercase block">{dayNamesShort[d.getDay()]}</span>
              </td>
              {habits.map(h => <td key={h.id} className="text-center"></td>)}
              {blankColumns.map((_, i) => <td key={`bb-${i}-${d.getDate()}`}></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}