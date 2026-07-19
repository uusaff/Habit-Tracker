<<<<<<< HEAD
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginScreen from './Login';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Footprints, BookOpen, Moon, Leaf, Dumbbell, Droplet, Brain, Heart,
  Music, Camera, Coffee, PenLine, Plus, Trash2, Check,
  Quote as QuoteIcon, Flame, User, Calendar, Edit3, X,
  Award, Target, Sun, Printer, Minus, Settings, BarChart2,
  Zap, Trophy, Sparkles, ChevronRight, ChevronLeft, Activity, LogOut,
  Shield, Share2, Webhook, AlertCircle
} from 'lucide-react';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { usePatternDetection } from './hooks/usePatternDetection';
import { useWebhooks, exportToJSON, exportToICS } from './hooks/useWebhooks';
import QuantitativeCheckinCell from './components/QuantitativeCheckinCell';
import NegativeHabitCard from './components/NegativeHabitCard';
import ContributionHeatmap from './components/ContributionHeatmap';
import ProjectedStreak from './components/ProjectedStreak';
import HabitTrendMiniChart from './components/HabitTrendMiniChart';
import WeeklyChallenge from './components/WeeklyChallenge';
import AccountabilityScore from './components/AccountabilityScore';
import ShareCard from './components/ShareCard';
import WebhookSettings from './components/WebhookSettings';
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
<<<<<<< HEAD
=======
const STORAGE_KEY = 'tropical-habit-tracker-v1';
const PROFILE_STORAGE_KEY = 'tropical-habit-tracker-profile-v1';
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

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

<<<<<<< HEAD
=======
const DEFAULT_HABITS = [
  { id: 'h1', name: 'Daily Steps', icon: 'Footprints', color: 'teal', category: 'Anytime' },
  { id: 'h2', name: 'Deep Work', icon: 'BookOpen', color: 'purple', category: 'Morning' },
  { id: 'h3', name: 'Sleep Tracking', icon: 'Moon', color: 'sky', category: 'Evening' },
  { id: 'h4', name: 'Hydration', icon: 'Droplet', color: 'sky', category: 'Anytime' },
];

const DEFAULT_DATA = { habits: DEFAULT_HABITS, checkins: {} };
const DEFAULT_PROFILE = { name: '', age: '', weight: '', height: '' };

>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
=======
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getMonthDates(year, month) {
  const total = daysInMonth(year, month);
  return Array.from({ length: total }, (_, i) => new Date(year, month, i + 1));
}
<<<<<<< HEAD
function sanitizeInput(input) {
  return input.replace(/[<>&"']/g, (char) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;'
  }[char]));
}

function getEntry(checkins, dKey, habitId) {
  const v = checkins[dKey]?.[habitId];
  if (!v) return { status: 'unchecked', note: '', value: 0 };
  if (v === true) return { status: 'checked', note: '', value: 1 };
  return { status: v.status || 'unchecked', note: v.note || '', value: v.value != null ? v.value : (v.status === 'checked' ? 1 : 0) };
=======
function getEntry(checkins, dKey, habitId) {
  const v = checkins[dKey]?.[habitId];
  if (!v) return { status: 'unchecked', note: '' };
  if (v === true) return { status: 'checked', note: '' };
  return { status: v.status || 'unchecked', note: v.note || '' };
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
function exportToCSVString(habits, checkins) {
=======
function exportToCSV(habits, checkins) {
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
  return [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
=======
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `habit-tracker-${dateKey(new Date())}.csv`;
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

<<<<<<< HEAD
function exportToCSV(habits, checkins) {
  downloadFile(exportToCSVString(habits, checkins), `habit-tracker-${dateKey(new Date())}.csv`, 'text/csv');
}

=======
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
    className={`w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 ${className}`}
=======
    className={`w-full max-w-6xl mx-auto px-4 sm:px-8 py-12 ${className}`}
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
=======
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
  const [expandedHabitId, setExpandedHabitId] = useState(null);
=======
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

  // Profile Form State
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState('');
  const [pWeight, setPWeight] = useState('');
<<<<<<< HEAD
=======
  const [pHeight, setPHeight] = useState('');
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

  // Print State
  const [selectedPrintMonth, setSelectedPrintMonth] = useState(() => new Date().getMonth());
  const [printMonth, setPrintMonth] = useState(() => new Date().getMonth());
<<<<<<< HEAD
  const printYear = new Date().getFullYear();

  // Admin State
  const [isAdmin, setIsAdmin] = useState(null);

  // Authentication & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        getDoc(doc(db, '_admins', currentUser.uid)).then(snap => {
          setIsAdmin(snap.exists());
        }).catch(() => setIsAdmin(false));
      } else {
        setIsAdmin(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth();

  const {
    habits,
    checkins,
    profile,
    ready,
    error,
    getEntry: getEntryHook,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCheckin,
    setCheckinNote,
    toggleRelapse,
    getDaysSinceLast,
    getStreak: getStreakHook,
    saveProfile,
  } = useFirestoreSync(user?.uid);

  const { skipPatterns, consistencyTrend, bestWorst, streakProjection, weeklySummary } = usePatternDetection(habits, checkins, today);

  const { webhooks, addWebhook, removeWebhook, testWebhook, lastResult, events, setLastResult } = useWebhooks();
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

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
<<<<<<< HEAD
  const todayKey = dateKey(today);
  const monthDates = useMemo(() => getMonthDates(year, month), [year, month]);
  const daysElapsed = today.getDate();

  const getStreak = useCallback((habitId) => getStreakHook(habitId)?.current || 0, [getStreakHook]);

  const currentStreak = useMemo(() => habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0), [habits, getStreak]);
  const bestStreakEver = useMemo(() => habits.reduce((max, h) => Math.max(max, getLongestStreak(h.id, checkins)), 0), [habits, checkins]);
  const totalCheckins = useMemo(() => habits.reduce((acc, h) => acc + Object.keys(checkins).filter(k => getEntryHook(k, h.id).status === 'checked').length, 0), [habits, getEntryHook, checkins]);
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
  
  // XP & Level System
  const totalXP = totalCheckins * 10;
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpToNext = 100 - (totalXP % 100);
  const xpProgress = (totalXP % 100);

  const monthlyCompleted = useMemo(() => {
    let count = 0;
    monthDates.forEach((d) => {
      if (d > today) return;
<<<<<<< HEAD
      habits.forEach((h) => { if (getEntryHook(dateKey(d), h.id).status === 'checked') count++; });
    });
    return count;
  }, [monthDates, habits, today, getEntryHook]);

  const todayChecked = habits.filter((h) => getEntryHook(todayKey, h.id).status === 'checked').length;
=======
      habits.forEach((h) => { if (getEntry(checkins, dateKey(d), h.id).status === 'checked') count++; });
    });
    return count;
  }, [monthDates, habits, checkins, today]);

  const habitMonthlyCount = (habitId) => {
    return monthDates.filter(d => d <= today && getEntry(checkins, dateKey(d), habitId).status === 'checked').length;
  };

  const todayChecked = habits.filter((h) => getEntry(checkins, todayKey, h.id).status === 'checked').length;
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
  const totalHabits = habits.length;
  const pct = totalHabits === 0 ? 0 : Math.round((todayChecked / totalHabits) * 100);
  const monthlyTotalPossible = habits.length * daysElapsed;
  const monthlyRate = monthlyTotalPossible === 0 ? 0 : Math.round((monthlyCompleted / monthlyTotalPossible) * 100);

<<<<<<< HEAD
  // Analytics Chart Data Preparation
  const weeklyData = useMemo(() => weekDates.map(d => {
    const k = dateKey(d);
    return {
      day: dayNamesShort[d.getDay()],
      count: habits.filter(h => getEntryHook(k, h.id).status === 'checked').length
    };
  }), [weekDates, habits, getEntryHook]);
  const maxWeeklyCount = useMemo(() => Math.max(...weeklyData.map(d => d.count), 1), [weeklyData]);

  // AI Insights generation (pattern-aware)
  const insights = useMemo(() => {
    const res = [];
    if (currentStreak > 3) res.push(`You're on fire! A ${currentStreak}-day streak is incredible. Keep the momentum going.`);
    if (bestWorst?.best && bestWorst.best.rate > 70) res.push(`${bestWorst.best.name} is your strongest — ${bestWorst.best.rate}% consistency this month.`);
    if (bestWorst?.worst && bestWorst.worst.rate < 40) res.push(`${bestWorst.worst.name} needs attention — only ${bestWorst.worst.rate}% consistency. Small steps!`);
    skipPatterns.forEach((p) => res.push(`You often skip "${p.habitName}" on ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][p.day]}s. Try setting a reminder.`));
    const declining = consistencyTrend.filter((t) => t.direction === 'down').slice(0, 2);
    declining.forEach((t) => res.push(`Your "${t.habitName}" consistency dropped ${t.change}% over the last month. Let's turn that around.`));
    const improving = consistencyTrend.filter((t) => t.direction === 'up').slice(0, 1);
    improving.forEach((t) => res.push(`Great improvement on "${t.habitName}" — up ${t.change}% in the last month!`));
    if (weeklySummary.rate >= 80) res.push(`This week: ${weeklySummary.rate}% complete. Outstanding consistency!`);
    else if (weeklySummary.rate >= 50) res.push(`This week: ${weeklySummary.rate}% complete. You're building momentum.`);
    else res.push(`This week: ${weeklySummary.rate}% complete. Every day is a fresh start.`);
    return res.slice(0, 5);
  }, [currentStreak, bestWorst, skipPatterns, consistencyTrend, weeklySummary]);

  // Actions
  const handleToggle = useCallback((habitId, dKey) => {
    toggleCheckin(habitId, dKey);
  }, [toggleCheckin]);

  const handleSetCheckinNote = useCallback((habitId, dKey) => {
    const current = getEntryHook(dKey, habitId);
    const note = window.prompt('Note for this check-in:', current.note || '');
    if (note === null) return;
    const sanitized = sanitizeInput(note.trim());
    if (sanitized.length > 500) { window.alert('Note is too long (max 500 characters).'); return; }
    setCheckinNote(habitId, dKey, sanitized);
  }, [getEntryHook, setCheckinNote]);
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

  const saveHabit = () => {
    if (!newName.trim()) return;
    if (editingHabitId) {
<<<<<<< HEAD
      updateHabit(editingHabitId, {
        name: newName.trim(),
        icon: newIcon,
        color: newColor,
        category: newCategory,
      });
    } else {
      addHabit({
        name: sanitizeInput(newName.trim()),
        icon: newIcon,
        color: newColor,
        category: newCategory,
        type: 'binary',
      });
=======
      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((h) => h.id === editingHabitId ? { ...h, name: newName.trim(), icon: newIcon, color: newColor, category: newCategory } : h),
      }));
    } else {
      setData((prev) => ({
        ...prev,
        habits: [...prev.habits, { id: "h" + Date.now(), name: newName.trim(), icon: newIcon, color: newColor, category: newCategory }],
      }));
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
    }
    cancelForm();
  };

  const cancelForm = () => {
    setNewName(""); setNewIcon("Footprints"); setNewColor("teal"); setNewCategory("Anytime"); setEditingHabitId(null); setShowAddForm(false);
  };

<<<<<<< HEAD
  const handleDeleteHabit = useCallback((id) => deleteHabit(id), [deleteHabit]);
=======
  const deleteHabit = (id) => setData((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== id) }));
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

  // Navigation Links
  const navLinks = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'habits', icon: Check, label: 'Habits' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'achievements', icon: Trophy, label: 'Awards' },
  ];

  if (!user) return <LoginScreen />;
<<<<<<< HEAD
  if (isAdmin && ready) return <AdminDashboard handleSignOut={() => signOut(auth)} />;
  if (error) return <ErrorScreen error={error} theme={theme} onRetry={() => window.location.reload()} />;
  if (!ready || isAdmin === null) return <LoadingScreen theme={theme} />;
=======
  if (user.email === 'uussaff@gmail.com') return <AdminDashboard handleSignOut={() => signOut(auth)} />;
  if (!data || !profile) return <LoadingScreen theme={theme} />;
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

  return (
    <>
      <div className="print:hidden relative min-h-screen font-sans text-slate-800 dark:text-slate-200 selection:bg-teal-500/30 overflow-x-hidden">
        <CinematicBackground theme={theme} />

<<<<<<< HEAD
        {/* Expandable Left Sidebar (now consistent across mobile & desktop) */}
        <nav className="fixed top-1/2 -translate-y-1/2 left-2 sm:left-4 md:left-6 z-50 flex items-start group">
          <GlassCard
            className={`flex flex-col items-start p-2 gap-1 rounded-[1.75rem] border-white/40 dark:border-white/10 transition-all duration-300 overflow-hidden ${
              isNavExpanded ? 'w-[170px] sm:w-[200px]' : 'w-[52px] sm:w-[68px] md:hover:w-[200px]'
            }`}
            hover={false}
          >
            {/* Theme Toggle Button — desktop only here; mobile uses the header button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex p-3 rounded-2xl text-amber-500 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-all items-center shrink-0 w-full outline-none"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0 mx-0" /> : <Moon className="w-5 h-5 shrink-0 mx-0" />}
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
              <span className={`whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ${isNavExpanded ? 'ml-3 opacity-100 w-auto' : 'w-0 md:group-hover:opacity-100 md:group-hover:ml-3 md:group-hover:w-auto hidden md:block'}`}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

<<<<<<< HEAD
            {/* Divider (desktop only, sits under the theme toggle) */}
            <div className="hidden md:block bg-stone-200 dark:bg-stone-700 shrink-0 w-full h-px my-1" />
=======
            {/* Divider */}
            <div className={`bg-stone-200 dark:bg-stone-700 shrink-0 ${isNavExpanded ? 'w-full h-px my-1' : 'w-px h-6 mx-1 md:w-full md:h-px md:my-1 md:mx-0'}`} />
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

            {/* Nav Links */}
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setIsNavExpanded(false)}
<<<<<<< HEAD
                className="p-2.5 sm:p-3 rounded-2xl text-stone-500 hover:text-teal-600 dark:text-stone-400 dark:hover:text-teal-400 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-all flex items-center shrink-0 w-full outline-none"
              >
                <link.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mx-0" />
=======
                className="p-3 rounded-full md:rounded-2xl text-stone-500 hover:text-teal-600 dark:text-stone-400 dark:hover:text-teal-400 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-all flex items-center shrink-0 w-full outline-none"
              >
                <link.icon className="w-5 h-5 shrink-0 mx-auto md:mx-0" />
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                <span className={`whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ${isNavExpanded ? 'ml-3 opacity-100 w-auto' : 'w-0 md:group-hover:opacity-100 md:group-hover:ml-3 md:group-hover:w-auto hidden md:block'}`}>
                  {link.label}
                </span>
              </a>
            ))}

            {/* Divider */}
<<<<<<< HEAD
            <div className="bg-stone-200 dark:bg-stone-700 shrink-0 w-full h-px my-1" />
=======
            <div className={`bg-stone-200 dark:bg-stone-700 shrink-0 ${isNavExpanded ? 'w-full h-px my-1' : 'w-px h-6 mx-1 md:w-full md:h-px md:my-1 md:mx-0'}`} />
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

            {/* Settings */}
            <button
              onClick={() => { setShowSettings(true); setIsNavExpanded(false); }}
<<<<<<< HEAD
              className="p-2.5 sm:p-3 rounded-2xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white transition-all flex items-center shrink-0 w-full outline-none"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mx-0" />
=======
              className="p-3 rounded-full md:rounded-2xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white transition-all flex items-center shrink-0 w-full outline-none"
            >
              <Settings className="w-5 h-5 shrink-0 mx-auto md:mx-0" />
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
              <span className={`whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ${isNavExpanded ? 'ml-3 opacity-100 w-auto' : 'w-0 md:group-hover:opacity-100 md:group-hover:ml-3 md:group-hover:w-auto hidden md:block'}`}>
                Settings
              </span>
            </button>

<<<<<<< HEAD
            {/* Log Out */}
            <button
              onClick={() => signOut(auth)}
              className="p-2.5 sm:p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center shrink-0 w-full outline-none"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mx-0" />
=======
            {/* Log Out (Only shows horizontally if expanded on Mobile, or automatically on Desktop) */}
            <button
              onClick={() => signOut(auth)}
              className={`p-3 rounded-full md:rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all items-center shrink-0 w-full outline-none ${isNavExpanded ? 'flex' : 'hidden md:flex'}`}
            >
              <LogOut className="w-5 h-5 shrink-0 mx-auto md:mx-0" />
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
              <span className={`whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ${isNavExpanded ? 'ml-3 opacity-100 w-auto' : 'w-0 md:group-hover:opacity-100 md:group-hover:ml-3 md:group-hover:w-auto hidden md:block'}`}>
                Log Out
              </span>
            </button>

<<<<<<< HEAD
            {/* Arrow to expand/collapse (mobile & tablet, since they lack hover) */}
            <button
              onClick={() => setIsNavExpanded(!isNavExpanded)}
              className="md:hidden p-2.5 rounded-2xl text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors shrink-0 w-full flex justify-center outline-none"
            >
              {isNavExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
=======
            {/* Mobile Arrow Button to expand/collapse (Visible only on Mobile) */}
            <button
              onClick={() => setIsNavExpanded(!isNavExpanded)}
              className={`md:hidden p-3 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors shrink-0 w-full flex justify-center outline-none`}
            >
              {isNavExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
            </button>
          </GlassCard>
        </nav>

        {/* Main Content Wrapper */}
<<<<<<< HEAD
        <main className="ml-14 sm:ml-20 md:ml-24 pb-16 sm:pb-20 md:pb-24 pt-6 sm:pt-8 md:pt-10">
          
          {/* Top Header */}
          <header className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 mb-8 sm:mb-12 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-[1px]">
                <div className="w-full h-full bg-white/20 dark:bg-black/20 rounded-xl sm:rounded-2xl backdrop-blur flex items-center justify-center">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight hidden sm:block">Aura Tracker</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Small top theme toggle — mobile only, desktop keeps the sidebar toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="md:hidden p-2 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm text-amber-500 hover:shadow-md transition-all"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
                    {greeting}, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-500">{profile.name?.split(' ')[0] || 'Explorer'}</span>.
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-stone-500 dark:text-stone-400 mt-3 sm:mt-4 max-w-xl leading-relaxed">
=======
                  <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
                    {greeting}, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-500">{profile.name?.split(' ')[0] || 'Explorer'}</span>.
                  </h1>
                  <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-400 mt-4 max-w-xl leading-relaxed">
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                    You have <strong className="text-stone-800 dark:text-stone-200">{totalHabits - todayChecked} habits</strong> remaining today. Keep building the life you want.
                  </p>
                </div>

<<<<<<< HEAD
                <div className="flex gap-4 pt-2 sm:pt-4">
                  <button onClick={() => document.getElementById('habits').scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
=======
                <div className="flex gap-4 pt-4">
                  <button onClick={() => document.getElementById('habits').scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                    Start Check-ins <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Ring Hero */}
<<<<<<< HEAD
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 shrink-0 flex items-center justify-center">
=======
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 shrink-0 flex items-center justify-center">
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-stone-800 to-stone-500 dark:from-white dark:to-stone-400">
                      <AnimatedNumber value={pct} />%
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-widest">Today's Goal</p>
=======
                    <span className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-stone-800 to-stone-500 dark:from-white dark:to-stone-400">
                      <AnimatedNumber value={pct} />%
                    </span>
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-widest">Today's Goal</p>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                  </div>
                </GlassCard>
              </div>
            </div>
          </ScrollSection>

          {/* 2. QUICK ACTIONS & LEVEL SYSTEM */}
          <ScrollSection>
<<<<<<< HEAD
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Level Card */}
              <GlassCard className="col-span-1 md:col-span-2 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
                  <Zap className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
=======
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level Card */}
              <GlassCard className="col-span-1 md:col-span-2 p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
                  <Zap className="w-10 h-10 text-white" />
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-end mb-2">
                    <div>
<<<<<<< HEAD
                      <p className="text-xs sm:text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Current Level</p>
                      <h3 className="text-lg sm:text-2xl font-bold">Level {currentLevel}</h3>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-stone-500">{xpToNext} XP to next</p>
                  </div>
                  <div className="h-2.5 sm:h-3 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
=======
                      <p className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Current Level</p>
                      <h3 className="text-2xl font-bold">Level {currentLevel}</h3>
                    </div>
                    <p className="text-sm font-medium text-stone-500">{xpToNext} XP to next</p>
                  </div>
                  <div className="h-3 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${xpProgress}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500" />
                  </div>
                </div>
              </GlassCard>

              {/* Action Buttons */}
<<<<<<< HEAD
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button onClick={() => setShowAddForm(true)} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />
                  <span className="text-xs sm:text-sm font-semibold">Add Habit</span>
                </button>
                <button onClick={() => setShowPrintModal(true)} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-stone-500 dark:text-stone-400" />
                  <span className="text-xs sm:text-sm font-semibold">Print</span>
=======
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowAddForm(true)} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Plus className="w-6 h-6 text-teal-500" />
                  <span className="text-sm font-semibold">Add Habit</span>
                </button>
                <button onClick={() => setShowPrintModal(true)} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Printer className="w-6 h-6 text-stone-500 dark:text-stone-400" />
                  <span className="text-sm font-semibold">Print</span>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                </button>
              </div>
            </div>
          </ScrollSection>

          {/* 3. PREMIUM STATISTICS */}
          <ScrollSection>
<<<<<<< HEAD
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2"><Activity className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" /> Performance Metrics</h2>
=======
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity className="w-6 h-6 text-orange-500" /> Performance Metrics</h2>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Your Habits</h2>
=======
              <h2 className="text-3xl font-bold tracking-tight">Your Habits</h2>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
              <div className="flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1 rounded-full border border-white/60 dark:border-white/10">
                <button onClick={() => setViewMode('weekly')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'weekly' ? 'bg-white dark:bg-stone-800 shadow-sm text-teal-600 dark:text-teal-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}>Weekly</button>
                <button onClick={() => setViewMode('monthly')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-white dark:bg-stone-800 shadow-sm text-teal-600 dark:text-teal-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}>Monthly</button>
              </div>
            </div>

            <GlassCard className="p-2 sm:p-6">
              {viewMode === 'weekly' && (
                <div className="space-y-8">
                  {/* Weekly Header */}
<<<<<<< HEAD
                  <div className="flex items-center mb-2 px-1 sm:px-2">
                    <div className="w-16 sm:w-48 shrink-0" />
=======
                  <div className="flex items-center mb-2 px-2">
                    <div className="w-32 sm:w-48 shrink-0" />
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                    {weekDates.map((d, i) => {
                      const isToday = dateKey(d) === todayKey;
                      return (
                        <div key={i} className="flex-1 text-center">
<<<<<<< HEAD
                          <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400 dark:text-stone-500'}`}>{dayNamesShort[d.getDay()]}</div>
                          <div className={`text-sm sm:text-lg mt-1 font-medium ${isToday ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center' : 'text-stone-500 dark:text-stone-400'}`}>{d.getDate()}</div>
=======
                          <div className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400 dark:text-stone-500'}`}>{dayNamesShort[d.getDay()]}</div>
                          <div className={`text-lg mt-1 font-medium ${isToday ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 w-8 h-8 mx-auto rounded-full flex items-center justify-center' : 'text-stone-500 dark:text-stone-400'}`}>{d.getDate()}</div>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
                          const isExpanded = expandedHabitId === habit.id;
                          return (
                            <motion.div layout key={habit.id}>
                              <div className="flex items-center bg-white/60 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 rounded-2xl p-2 sm:p-3 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700 group shadow-sm">
                                <div className="w-16 sm:w-48 shrink-0 flex items-center gap-1.5 sm:gap-3 pr-1 sm:pr-2">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${color.light} flex items-center justify-center shrink-0`}>
                                    <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${color.text}`} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <button onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)} className="text-left w-full">
                                      <p className="text-[11px] sm:text-sm font-bold text-stone-800 dark:text-stone-100 truncate">{habit.name}</p>
                                      <div className="hidden sm:flex items-center gap-2 mt-0.5">
                                        {streak > 0 && <span className="text-[10px] font-semibold text-orange-500 flex items-center gap-0.5 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3"/> {streak}</span>}
                                      </div>
                                    </button>
                                  </div>
                                  <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1">
                                    <button onClick={() => { setEditingHabitId(habit.id); setNewName(habit.name); setNewIcon(habit.icon); setNewColor(habit.color); setNewCategory(habit.category || 'Anytime'); setShowAddForm(true); }} className="p-1.5 text-stone-400 hover:text-teal-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"><Edit3 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteHabit(habit.id)} className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>

                                {weekDates.map((d, i) => {
                                  const k = dateKey(d);
                                  const entry = getEntry(checkins, k, habit.id);
                                  return (
                                    <div key={i} className="flex-1 flex justify-center relative">
                                      {habit.type === 'quantitative' ? (
                                        <QuantitativeCheckinCell
                                          value={entry.value || 0}
                                          target={habit.target || 1}
                                          unit={habit.unit || ''}
                                          color={color}
                                          isFuture={k > todayKey}
                                          disabled={k !== todayKey}
                                          onIncrement={() => toggleCheckin(habit.id, k, { status: 'checked', value: Math.min((entry.value || 0) + 1, habit.target || 1) })}
                                          onDecrement={() => toggleCheckin(habit.id, k, { status: 'checked', value: Math.max((entry.value || 0) - 1, 0) })}
                                          onSetValue={(v) => toggleCheckin(habit.id, k, { status: 'checked', value: v })}
                                        />
                                      ) : (
                                        <PremiumCheckinCell status={entry.status} note={entry.note} color={color} isFuture={k > todayKey} isLocked={k !== todayKey} onToggle={() => handleToggle(habit.id, k)} onNote={() => handleSetCheckinNote(habit.id, k)} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Expandable Trend Chart */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden pl-16 sm:pl-48 pr-2 sm:pr-3 pb-2"
                                  >
                                    <HabitTrendMiniChart
                                      habitId={habit.id}
                                      checkins={checkins}
                                      days={28}
                                      colorKey={habit.color}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
                                  <button onClick={() => { if(k <= todayKey) handleToggle(habit.id, k); }} disabled={k > todayKey} className={`w-5 h-5 rounded-md border transition-all ${k > todayKey ? 'border-transparent bg-stone-100/50 dark:bg-stone-800/30' : entry.status === 'checked' ? `${color.solid} border-transparent scale-110 shadow-sm` : entry.status === 'skipped' ? 'border-dashed border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-800' : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 hover:border-stone-400'}`} />
=======
                                  <button onClick={() => { if(k <= todayKey) toggleCheckin(habit.id, k); }} disabled={k > todayKey} className={`w-5 h-5 rounded-md border transition-all ${k > todayKey ? 'border-transparent bg-stone-100/50 dark:bg-stone-800/30' : entry.status === 'checked' ? `${color.solid} border-transparent scale-110 shadow-sm` : entry.status === 'skipped' ? 'border-dashed border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-800' : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 hover:border-stone-400'}`} />
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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

<<<<<<< HEAD
          {/* 5. VICES — HABITS TO BREAK */}
          {habits.filter(h => h.type === 'negative').length > 0 && (
            <ScrollSection id="vices">
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2"><Flame className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" /> Vices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {habits.filter(h => h.type === 'negative').map(habit => {
                  const color = COLORS[habit.color] || COLORS.rose;
                  const daysSince = getDaysSinceLast(habit.id, 'relapse');
                  const streakInfo = getStreakHook(habit.id);
                  return (
                    <NegativeHabitCard
                      key={habit.id}
                      habit={habit}
                      color={color}
                      daysSinceLast={daysSince != null ? daysSince : 0}
                      longestStreak={streakInfo?.longest || 0}
                      onRelapse={() => toggleRelapse(habit.id, todayKey)}
                    />
                  );
                })}
              </div>
            </ScrollSection>
          )}

          {/* 6. ANALYTICS DASHBOARD */}
          <ScrollSection id="analytics">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" /> Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Weekly Bar Chart */}
              <GlassCard className="p-4 sm:p-6 h-64 sm:h-80 flex flex-col">
                <h3 className="text-xs sm:text-sm font-bold text-stone-500 uppercase tracking-widest mb-4 sm:mb-6">This Week's Activity</h3>
                <div className="flex-1 flex items-end justify-between gap-1.5 sm:gap-2 px-1 sm:px-2">
                  {weeklyData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 sm:gap-3 w-full group relative">
                      <div className="absolute -top-8 bg-stone-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{d.count}</div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-t-xl overflow-hidden relative flex items-end justify-center" style={{ height: '130px' }}>
                         <motion.div initial={{ height: 0 }} whileInView={{ height: `${maxWeeklyCount > 0 ? (d.count / maxWeeklyCount) * 100 : 0}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="w-full bg-gradient-to-t from-teal-500 to-sky-400 rounded-t-xl" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-stone-500">{d.day}</span>
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Insights Component */}
<<<<<<< HEAD
              <GlassCard className="p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-500 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500"/> AI Insights</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {insights.map((insight, idx) => (
                      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.2 }} key={idx} className="flex gap-2.5 sm:gap-3 items-start bg-white/50 dark:bg-stone-800/50 p-3 sm:p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mt-1.5 shrink-0" />
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium leading-relaxed">{insight}</p>
=======
              <GlassCard className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500"/> AI Insights</h3>
                  <div className="space-y-4">
                    {insights.map((insight, idx) => (
                      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.2 }} key={idx} className="flex gap-3 items-start bg-white/50 dark:bg-stone-800/50 p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mt-1.5 shrink-0" />
                        <p className="text-sm text-stone-700 dark:text-stone-300 font-medium leading-relaxed">{insight}</p>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>
<<<<<<< HEAD

              {/* Streak Projection */}
              <GlassCard className="p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-500 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2"><Target className="w-4 h-4 text-purple-500"/> Milestones</h3>
                  <ProjectedStreak
                    currentStreak={currentStreak}
                    avgRate={(() => { const best = streakProjection.find((p) => p.currentStreak === currentStreak); return best?.avgRate || 0; })()}
                    nextMilestones={(() => { const best = streakProjection.find((p) => p.currentStreak === currentStreak); return best?.nextMilestones || []; })()}
                  />
                </div>
              </GlassCard>
            </div>

            {/* Habit Trend Mini-Charts */}
            <div className="mt-4 sm:mt-6">
              <GlassCard className="p-4 sm:p-6">
                <h3 className="text-xs sm:text-sm font-bold text-stone-500 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-teal-500"/> Activity Heatmap</h3>
                <ContributionHeatmap
                  data={(() => {
                    const map = {};
                    Object.keys(checkins).forEach(dk => {
                      const entries = checkins[dk] || {};
                      let count = 0;
                      habits.forEach(h => {
                        const e = entries[h.id];
                        if (e && (e === true || e.status === 'checked')) count++;
                      });
                      if (count > 0) map[dk] = count;
                    });
                    return map;
                  })()}
                  startDate={new Date(today.getFullYear(), 0, 1)}
                  endDate={today}
                  maxCount={habits.length}
                  emptyMessage="No activity recorded this year"
                />
              </GlassCard>
            </div>
          </ScrollSection>

          {/* 7. ACHIEVEMENTS */}
          <ScrollSection id="achievements">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2"><Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
=======
            </div>
          </ScrollSection>

          {/* 6. ACHIEVEMENTS */}
          <ScrollSection id="achievements">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" /> Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
              {ACHIEVEMENTS.map(ach => {
                const isUnlocked = ach.isStreak ? bestStreakEver >= ach.req : totalCheckins >= ach.req;
                const progress = ach.isStreak ? bestStreakEver : totalCheckins;
                const pct = Math.min((progress / ach.req) * 100, 100);
                const color = COLORS[ach.color];

                return (
<<<<<<< HEAD
                  <GlassCard key={ach.id} hover={false} className={`p-3 sm:p-5 relative overflow-hidden flex flex-col items-center text-center transition-all duration-500 ${isUnlocked ? 'border-yellow-300/50 dark:border-yellow-500/30' : 'opacity-70 grayscale-[0.5]'}`}>
                    {isUnlocked && <div className={`absolute inset-0 bg-gradient-to-br ${color.grad} opacity-[0.05]`} />}
                    <div className={`w-11 h-11 sm:w-16 sm:h-16 rounded-full mb-2 sm:mb-3 flex items-center justify-center text-lg sm:text-3xl shadow-inner relative z-10 ${isUnlocked ? color.light : 'bg-stone-100 dark:bg-stone-800'}`}>
                      {ach.icon}
                    </div>
                    <h4 className={`font-bold text-xs sm:text-sm mb-1 ${isUnlocked ? 'text-stone-900 dark:text-white' : 'text-stone-500'}`}>{ach.title}</h4>
                    <p className="text-[9px] sm:text-[10px] text-stone-500 font-medium mb-3 sm:mb-4 h-7 sm:h-8">{ach.desc}</p>
=======
                  <GlassCard key={ach.id} hover={false} className={`p-5 relative overflow-hidden flex flex-col items-center text-center transition-all duration-500 ${isUnlocked ? 'border-yellow-300/50 dark:border-yellow-500/30' : 'opacity-70 grayscale-[0.5]'}`}>
                    {isUnlocked && <div className={`absolute inset-0 bg-gradient-to-br ${color.grad} opacity-[0.05]`} />}
                    <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center text-3xl shadow-inner relative z-10 ${isUnlocked ? color.light : 'bg-stone-100 dark:bg-stone-800'}`}>
                      {ach.icon}
                    </div>
                    <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-stone-900 dark:text-white' : 'text-stone-500'}`}>{ach.title}</h4>
                    <p className="text-[10px] text-stone-500 font-medium mb-4 h-8">{ach.desc}</p>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mt-auto">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} className={`h-full ${isUnlocked ? color.solid : 'bg-stone-400'}`} />
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </ScrollSection>

<<<<<<< HEAD
          {/* 8. ACCOUNTABILITY & SOCIAL */}
          <ScrollSection id="accountability">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2"><Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" /> Accountability</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <GlassCard className="p-4 sm:p-6 md:col-span-2">
                <AccountabilityScore habits={habits} checkins={checkins} today={today} />
              </GlassCard>
              <GlassCard className="p-4 sm:p-6">
                <WeeklyChallenge habits={habits} checkins={checkins} weekDates={weekDates} todayKey={todayKey} />
              </GlassCard>
              <GlassCard className="p-4 sm:p-6 md:col-span-3">
                <h3 className="text-xs sm:text-sm font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Share2 className="w-4 h-4 text-teal-500"/> Share Progress</h3>
                <ShareCard habits={habits} checkins={checkins} profile={profile} weeklySummary={weeklySummary} currentStreak={currentStreak} totalCheckins={totalCheckins} />
              </GlassCard>
            </div>
          </ScrollSection>

          {/* MOTIVATIONAL QUOTE */}
          <ScrollSection>
             <GlassCard className="max-w-3xl mx-auto p-6 pt-12 sm:p-12 text-center relative overflow-hidden border-t-4 border-t-teal-500">
               <QuoteIcon className="w-7 h-7 sm:w-12 sm:h-12 text-teal-500/20 absolute top-3 left-3 sm:top-4 sm:left-4 z-0 pointer-events-none" />
               <AnimatePresence mode="wait">
                  <motion.div key={quoteIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} className="relative z-10">
                    <p className="text-base sm:text-2xl font-serif text-stone-800 dark:text-stone-200 italic leading-relaxed mb-4 sm:mb-6">"{QUOTES[quoteIndex].text}"</p>
                    <p className="font-bold text-xs sm:text-sm uppercase tracking-widest text-teal-600 dark:text-teal-400">— {QUOTES[quoteIndex].author}</p>
=======
          {/* MOTIVATIONAL QUOTE */}
          <ScrollSection>
             <GlassCard className="max-w-3xl mx-auto p-8 sm:p-12 text-center relative overflow-hidden border-t-4 border-t-teal-500">
               <QuoteIcon className="w-12 h-12 text-teal-500/20 absolute top-4 left-4" />
               <AnimatePresence mode="wait">
                  <motion.div key={quoteIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
                    <p className="text-xl sm:text-2xl font-serif text-stone-800 dark:text-stone-200 italic leading-relaxed mb-6">"{QUOTES[quoteIndex].text}"</p>
                    <p className="font-bold text-sm uppercase tracking-widest text-teal-600 dark:text-teal-400">— {QUOTES[quoteIndex].author}</p>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
              <div className="p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5"/> Settings</h3>
                <div className="space-y-6">

                  {/* Webhook Configurations */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-1.5"><Webhook className="w-3.5 h-3.5"/> Webhooks</h4>
                    <WebhookSettings webhooks={webhooks} addWebhook={addWebhook} removeWebhook={removeWebhook} testWebhook={testWebhook} events={events} lastResult={lastResult} setLastResult={setLastResult} />
                  </div>

                  <hr className="border-stone-200 dark:border-stone-700" />

                  {/* Data Export */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-1.5">Export Data</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { downloadFile(exportToJSON(habits, checkins, profile), 'habit-tracker-export.json', 'application/json'); }} className="py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                        JSON
                      </button>
                      <button onClick={() => { const csv = exportToCSVString(habits, checkins); downloadFile(csv, `habits-${dateKey(today)}.csv`, 'text/csv'); }} className="py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                        CSV
                      </button>
                      <button onClick={() => { downloadFile(exportToICS(habits, checkins), 'habits.ics', 'text/calendar'); }} className="py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors col-span-2">
                        Calendar (.ics)
                      </button>
                    </div>
                  </div>

                  <hr className="border-stone-200 dark:border-stone-700" />

                  {/* Account */}
=======
              <div className="p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5"/> Account Settings</h3>
                <div className="space-y-6">
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
                  <button onClick={() => { saveProfile({ name: pName.trim(), age: Number(pAge), weight: Number(pWeight) }); setShowProfileForm(false); }} className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold mt-4">Save Changes</button>
=======
                  <button onClick={() => { setProfile({ name: pName.trim(), age: pAge, weight: pWeight, height: pHeight }); setShowProfileForm(false); }} className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold mt-4">Save Changes</button>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
    <GlassCard className="p-3 sm:p-5 flex flex-col justify-between h-full" hover={true}>
      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${c.light} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${c.text}`} />
        </div>
      </div>
      <div>
        <h4 className="text-xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">{value}</h4>
        <p className="text-[11px] sm:text-sm font-bold text-stone-500 uppercase tracking-wider mt-1">{label}</p>
        {sub && <p className="text-[10px] sm:text-xs text-stone-400 font-medium mt-1">{sub}</p>}
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
        className={`w-7 h-7 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-[18px] flex items-center justify-center transition-all duration-300 border-2 ${visual} focus:outline-none focus:ring-4 focus:ring-${color.solid.split('-')[1]}-500/30`}
      >
        {status === 'checked' && <motion.div initial={{scale:0}} animate={{scale:1}}><Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={3} /></motion.div>}
        {status === 'skipped' && <Minus className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />}
        {note && <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-stone-800" />}
=======
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[20px] flex items-center justify-center transition-all duration-300 border-2 ${visual} focus:outline-none focus:ring-4 focus:ring-${color.solid.split('-')[1]}-500/30`}
      >
        {status === 'checked' && <motion.div initial={{scale:0}} animate={{scale:1}}><Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} /></motion.div>}
        {status === 'skipped' && <Minus className="w-4 h-4" strokeWidth={3} />}
        {note && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-stone-800" />}
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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

<<<<<<< HEAD
const ErrorScreen = ({ error, theme, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <CinematicBackground theme={theme} />
    <div className="max-w-md text-center z-10">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-stone-800 dark:text-white mb-2">Connection Error</h2>
      <p className="text-sm text-stone-500 mb-6">Could not load your data. Check your connection and try again.</p>
      {error?.code && <p className="text-xs font-mono text-rose-500 mb-6 bg-rose-50 dark:bg-rose-950/20 px-4 py-2 rounded-xl inline-block">{error.code}</p>}
      <button onClick={onRetry} className="px-6 py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold shadow-lg hover:shadow-xl transition-all">Retry</button>
    </div>
  </div>
);

=======
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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
<<<<<<< HEAD
  const [adminCheck, setAdminCheck] = React.useState(null);
  const currentUser = auth.currentUser;

  React.useEffect(() => {
    if (!currentUser) return;
    const verifyAdmin = async () => {
      const snap = await getDoc(doc(db, '_admins', currentUser.uid));
      if (!snap.exists()) {
        setAdminCheck(false);
        return;
      }
      setAdminCheck(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id.slice(0, 8) + '...',
            name: data.profileData?.name || `User`,
            habitCount: data.trackerData?.habits?.length || 0,
            checkinCount: data.trackerData?.checkins ? Object.keys(data.trackerData.checkins).length : 0
          });
        });
        setAllUsers(usersData);
      } catch (error) { console.error("Error:", error); }
    };
    verifyAdmin();
  }, [currentUser]);

  if (adminCheck === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Access Denied</h1>
          <p className="text-stone-500">You do not have administrator privileges.</p>
          <button onClick={handleSignOut} className="mt-6 px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold">Sign Out</button>
        </div>
      </div>
    );
  }

  if (adminCheck === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
=======
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
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0

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
<<<<<<< HEAD
              <div key={i} className="p-4 bg-stone-50 rounded-2xl flex justify-between items-center border border-stone-100">
                <span className="font-bold text-stone-800">{u.name} <span className="text-stone-400 font-normal ml-2 text-sm">{u.id}</span></span>
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-bold">{u.habitCount} Habits</span>
=======
              <div key={u.id} className="p-4 bg-stone-50 rounded-2xl flex justify-between items-center border border-stone-100">
                <span className="font-bold text-stone-800">{u.profileData?.name || `User ${i + 1}`} <span className="text-stone-400 font-normal ml-2 text-sm">{u.id}</span></span>
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-bold">{u.trackerData?.habits?.length || 0} Habits</span>
>>>>>>> d1ac35b2057b4369ccdfb5030b233b32f72e7de0
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