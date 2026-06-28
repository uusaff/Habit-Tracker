import React, { useState, useEffect, useRef, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import LoginScreen from './Login';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Footprints, BookOpen, Moon, Leaf, Dumbbell, Droplet, Brain, Heart,
  Music, Camera, Coffee, PenLine, Plus, Trash2, Check,
  Quote as QuoteIcon, Flame, TrendingUp,
  User, Calendar, Edit3, X, Award, Target, Sun,
  Printer, Download, Minus
} from 'lucide-react';

const STORAGE_KEY = 'tropical-habit-tracker-v1';
const PROFILE_STORAGE_KEY = 'tropical-habit-tracker-profile-v1';

const ICONS = { Footprints, BookOpen, Moon, Leaf, Dumbbell, Droplet, Brain, Heart, Music, Camera, Coffee, PenLine };
const ICON_KEYS = Object.keys(ICONS);

const COLORS = {
  teal: { grad: 'from-teal-400 to-cyan-400', solid: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600' },
  orange: { grad: 'from-orange-400 to-amber-400', solid: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
  green: { grad: 'from-emerald-400 to-green-500', solid: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
  sand: { grad: 'from-amber-300 to-yellow-400', solid: 'bg-amber-400', light: 'bg-amber-50', text: 'text-amber-600' },
  rose: { grad: 'from-rose-400 to-pink-400', solid: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600' },
  sky: { grad: 'from-sky-400 to-blue-400', solid: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600' },
};
const COLOR_KEYS = Object.keys(COLORS);

const CATEGORIES = ['Morning', 'Anytime', 'Evening'];

const QUOTES = [
  'Discipline is choosing between what you want now and what you want most.',
  'Small daily improvements lead to staggering long-term results.',
  'Motivation gets you started. Discipline keeps you going.',
  "You don't have to be extreme, just consistent.",
  'The pain of discipline weighs ounces; the pain of regret weighs tons.',
  'Habits are the compound interest of self-improvement.',
  'Do something today that your future self will thank you for.',
  'Success is the sum of small efforts repeated daily.',
  'Discipline is the bridge between goals and accomplishment.',
  'Every action you take is a vote for the person you wish to become.',
];

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Daily Steps', icon: 'Footprints', color: 'teal', category: 'Anytime' },
  { id: 'h2', name: 'Research Hours', icon: 'BookOpen', color: 'orange', category: 'Morning' },
  { id: 'h3', name: 'Sleep Tracking', icon: 'Moon', color: 'sky', category: 'Evening' },
  { id: 'h4', name: 'Nature Exposure', icon: 'Leaf', color: 'green', category: 'Anytime' },
];

const DEFAULT_DATA = { habits: DEFAULT_HABITS, checkins: {} };
const DEFAULT_PROFILE = { name: '', age: '', weight: '', height: '' };

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function getWeekDates() {
  const start = startOfWeek(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
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
      current++;
      longest = Math.max(longest, current);
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


function StatCard({ icon: Icon, label, value, color }) {
  const c = COLORS[color] || COLORS.teal;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-md p-4 flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-xl ${c.light} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-stone-800 dark:text-white leading-tight truncate">{value}</p>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{label}</p>
      </div>
    </motion.div>
  );
}

function CheckinCell({ status, note, color, isFuture, size = 'lg', shape = 'circle', onToggle, onNote }) {
  const timerRef = useRef(null);
  const longPressed = useRef(false);

  const start = () => {
    longPressed.current = false;
    timerRef.current = setTimeout(() => { longPressed.current = true; onNote(); }, 550);
  };
  const cancel = () => clearTimeout(timerRef.current);
  const handleClick = () => {
    if (longPressed.current) { longPressed.current = false; return; }
    onToggle();
  };

  const dim = size === 'lg' ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-6 h-6';
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-md';

  let visual = 'border-2 border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 hover:border-stone-300';
  if (isFuture) visual = 'border-2 border-stone-100 bg-stone-50/50 opacity-50 cursor-not-allowed';
  else if (status === 'checked') visual = `${color.solid} border-transparent`;
  else if (status === 'skipped') visual = 'border-2 border-dashed border-stone-300 bg-stone-100 dark:bg-stone-700';

  return (
    <button
      disabled={isFuture}
      onClick={handleClick}
      onContextMenu={(e) => { if (!isFuture) { e.preventDefault(); onNote(); } }}
      onMouseDown={!isFuture ? start : undefined}
      onMouseUp={!isFuture ? cancel : undefined}
      onMouseLeave={!isFuture ? cancel : undefined}
      onTouchStart={!isFuture ? start : undefined}
      onTouchEnd={!isFuture ? cancel : undefined}
      title={note || ''}
      className={`relative ${dim} ${radius} flex items-center justify-center transition-colors ${visual} ${!isFuture ? 'cursor-pointer' : ''}`}
    >
      {status === 'checked' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      {status === 'skipped' && <Minus className="w-3.5 h-3.5 text-stone-400" strokeWidth={3} />}
      {note && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white" />}
    </button>
  );
}

function PrintView({ habits, year, month }) {
  const dates = getMonthDates(year, month);
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Agar habits kam hain, toh hum blank columns add kar denge taake page poora width le laye
  const MIN_COLUMNS = 7;
  const blankColumnsCount = Math.max(0, MIN_COLUMNS - habits.length);
  const blankColumns = Array.from({ length: blankColumnsCount });

  return (
    <div className="hidden print:block text-black bg-white" style={{ margin: 0, padding: 0 }}>
      {/* Print ke liye khaas CSS jisme humne layout ko zayada spread kiya hai */}
      <style>{`
        @media print { 
          @page { size: A4 portrait; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0;}
          /* Table ko poori screen pe force karne ke liye fixed layout */
          table { table-layout: fixed; width: 100%; }
          th { word-wrap: break-word; overflow-wrap: break-word; }
        }
      `}</style>

      {/* 👑 CUSTOM HEADER 👑 */}
      <div className="flex justify-between items-end mb-4 border-b-2 border-black pb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">Habit Tracker</h1>
          <h2 className="text-lg font-bold text-gray-700">{monthName} {year}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-0.5">A personal project by</p>
          <p className="text-sm font-bold text-black uppercase">M Yousaf</p>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">github.com/uusaff</p>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-[1.5px] border-gray-500 bg-gray-100 px-1 py-2 text-center font-bold text-[10px] w-12">
              Date
            </th>
            {/* Habits Header */}
            {habits.map((h) => (
              <th key={h.id} className="border-[1.5px] border-gray-500 bg-gray-100 px-1 py-1 text-center font-bold text-[9px] leading-tight align-bottom pb-2">
                <span className="block -rotate-90 origin-bottom whitespace-nowrap mb-6 h-20 text-left overflow-hidden">
                  {h.name}
                </span>
              </th>
            ))}
            {/* Extra Blank Headers */}
            {blankColumns.map((_, i) => (
              <th key={`blank-head-${i}`} className="border-[1.5px] border-gray-500 bg-gray-100 px-1 py-2 text-center text-gray-400 font-medium text-[9px]">

              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((d) => {
            const isWeekend = d.getDay() === 0 || d.getDay() === 6; // Sunday or Saturday
            return (
              <tr key={d.getDate()} className={isWeekend ? "bg-gray-50" : ""}>
                {/* Date Column */}
                <td className="border-[1.5px] border-gray-500 px-1 py-1 text-center whitespace-nowrap">
                  <span className="font-bold text-[11px]">{pad(d.getDate())}</span>
                  <span className="text-gray-500 text-[9px] ml-1 uppercase">{dayNames[d.getDay()]}</span>
                </td>

                {/* Empty Boxes for Habits */}
                {habits.map((h) => (
                  <td key={h.id} className="border-[1.5px] border-gray-500 text-center h-6"></td>
                ))}

                {/* Extra Blank Boxes */}
                {blankColumns.map((_, i) => (
                  <td key={`blank-body-${i}-${d.getDate()}`} className="border-[1.5px] border-gray-500 text-center h-6"></td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 👑 COPYRIGHT FOOTER 👑 */}
      <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between items-center text-[9px] text-gray-500">
        <p>© {new Date().getFullYear()} M Yousaf. All Rights Reserved.</p>
        <p>® Trademark Registered</p>
      </div>
    </div>
  );
}

export default function HabitTracker() {
 
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  
  const [user, setUser] = useState(null);

 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  
  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        
        const dbData = docSnap.data();
        setData(dbData.trackerData || DEFAULT_DATA);
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
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        trackerData: data,
        profileData: profile
      }, { merge: true }); 
    };
    
    saveUserData();
  }, [data, profile, user]); 

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Footprints');
  const [newColor, setNewColor] = useState('teal');
  const [newCategory, setNewCategory] = useState('Anytime');

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState('');
  const [pWeight, setPWeight] = useState('');
  const [pHeight, setPHeight] = useState('');
  const [viewMode, setViewMode] = useState('weekly');

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPrintMonth, setSelectedPrintMonth] = useState(() => new Date().getMonth());
  const [printMonth, setPrintMonth] = useState(() => new Date().getMonth());
  const [printYear, setPrintYear] = useState(() => new Date().getFullYear());

  const handleGeneratePrint = () => {
    setPrintMonth(selectedPrintMonth);
    setShowPrintModal(false);
    setTimeout(() => window.print(), 150);
  };

  const [theme, setTheme] = useState(() => {

    return localStorage.getItem('theme') || 'light';
  });

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

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const weekDates = useMemo(() => getWeekDates(), []);
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);

  const year = today.getFullYear();
  const month = today.getMonth();
  const monthDates = useMemo(() => getMonthDates(year, month), [year, month]);
  const daysElapsed = today.getDate();

  // safely destructure so hooks don't crash before data loads
  const habits = data?.habits || [];
  const checkins = data?.checkins || {};

  const getStreak = (habitId) => {
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const entry = getEntry(checkins, dateKey(cursor), habitId);
      if (entry.status === 'checked') {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (entry.status === 'skipped') {
        cursor.setDate(cursor.getDate() - 1); // ignored, doesn't break or extend
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = useMemo(() => {

    if (!habits || habits.length === 0) return 0;
    return habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0);
  }, [habits, checkins]);

  const habitMonthlyCount = (habitId) => {
    let count = 0;
    monthDates.forEach((d) => {
      if (d > today) return;
      const k = dateKey(d);
      if (getEntry(checkins, k, habitId).status === 'checked') count++;
    });
    return count;

  };

  const totalCheckins = useMemo(() => {
    let count = 0;
    habits.forEach((h) => {
      Object.keys(checkins).forEach((k) => {
        if (getEntry(checkins, k, h.id).status === 'checked') count++;
      });
    });
    return count;
  }, [checkins, habits]);

  const bestStreakEver = useMemo(
    () => habits.reduce((max, h) => Math.max(max, getLongestStreak(h.id, checkins)), 0),
    [habits, checkins]
  );

  const monthlyCompleted = useMemo(() => {
    let count = 0;
    monthDates.forEach((d) => {
      if (d > today) return;
      const k = dateKey(d);
      habits.forEach((h) => { if (getEntry(checkins, k, h.id).status === 'checked') count++; });
    });
    return count;
  }, [monthDates, habits, checkins, today]);

  const bestHabit = useMemo(() => {
    if (habits.length === 0) return null;
    let best = habits[0];
    let bestCount = habitMonthlyCount(best.id);
    habits.forEach((h) => {
      const c = habitMonthlyCount(h.id);
      if (c > bestCount) { best = h; bestCount = c; }
    });
    return bestCount > 0 ? { habit: best, count: bestCount } : null;
  }, [habits, checkins, monthDates]);



  const habitsByCategory = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach((c) => (groups[c] = []));
    habits.forEach((h) => {
      const cat = CATEGORIES.includes(h.category) ? h.category : 'Anytime';
      groups[cat].push(h);
    });
    return groups;
  }, [habits]);


  if (!user) {
    return <LoginScreen />;
  }

  if (user.email === 'uussaff@gmail.com') { 
    return <AdminDashboard handleSignOut={() => signOut(auth)} />;
  }

  if (!data || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-amber-50 dark:from-stone-900 dark:via-stone-800 dark:to-teal-950 dark:text-stone-200 transition-colors duration-500">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // General functions and UI variables below
  const monthTotalDays = monthDates.length;
  const monthlyTotalPossible = habits.length * daysElapsed;
  const monthlyRate = monthlyTotalPossible === 0 ? 0 : Math.round((monthlyCompleted / monthlyTotalPossible) * 100);

  const toggleCheckin = (habitId, dKey) => {
    setData((prev) => {
      const day = prev.checkins[dKey] || {};
      const current = getEntry(prev.checkins, dKey, habitId);
      const nextStatus =
        current.status === 'checked' ? 'skipped' :
          current.status === 'skipped' ? 'unchecked' : 'checked';
      const nextDay = { ...day, [habitId]: { status: nextStatus, note: current.note } };
      return { ...prev, checkins: { ...prev.checkins, [dKey]: nextDay } };
    });
  };

  const setCheckinNote = (habitId, dKey) => {
    const current = getEntry(data.checkins, dKey, habitId);
    const note = window.prompt('Note for this check-in:', current.note || '');
    if (note === null) return; // cancelled
    setData((prev) => {
      const day = prev.checkins[dKey] || {};
      const existing = getEntry(prev.checkins, dKey, habitId);
      return {
        ...prev,
        checkins: { ...prev.checkins, [dKey]: { ...day, [habitId]: { ...existing, note: note.trim() } } },
      };
    });
  };

  const openEditForm = (habit) => {
    setEditingHabitId(habit.id);
    setNewName(habit.name);
    setNewIcon(habit.icon);
    setNewColor(habit.color);
    setNewCategory(habit.category || 'Anytime');
    setShowAddForm(true);
  };

  const saveHabit = () => {
    if (!newName.trim()) return;

    if (editingHabitId) {
      // Update existing habit
      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === editingHabitId
            ? {
              ...h,
              name: newName.trim(),
              icon: newIcon,
              color: newColor,
              category: newCategory // <-- YAHAN ADD HUA HAI
            }
            : h
        ),
      }));
    } else {
      // Add new habit
      const id = "h" + Date.now();
      setData((prev) => ({
        ...prev,
        habits: [
          ...prev.habits,
          {
            id,
            name: newName.trim(),
            icon: newIcon,
            color: newColor,
            category: newCategory, // <-- YAHAN BHI ADD HUA HAI
          },
        ],
      }));
    }

    cancelForm();
  };

  const cancelForm = () => {
    setNewName("");
    setNewIcon("Footprints");
    setNewColor("teal");
    setNewCategory("Anytime");   // ← add this
    setEditingHabitId(null);
    setShowAddForm(false);
  };

  const deleteHabit = (id) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
    }));
  };

  const openProfileForm = () => {
    setPName(profile.name || '');
    setPAge(profile.age || '');
    setPWeight(profile.weight || '');
    setPHeight(profile.height || '');
    setShowProfileForm(true);
  };

  const saveProfile = () => {
    setProfile({ name: pName.trim(), age: pAge, weight: pWeight, height: pHeight });
    setShowProfileForm(false);
  };

  const todayChecked = habits.filter((h) => checkins[todayKey]?.[h.id]).length;
  const totalHabits = habits.length;
  const pct = totalHabits === 0 ? 0 : Math.round((todayChecked / totalHabits) * 100);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const LABEL_WIDTH = 'w-32 sm:w-44';




  return (
    <>
      <div className="print:hidden min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-50 via-teal-50 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-200 transition-colors duration-500 font-sans">


        <header className="relative z-20 w-full bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl border-b border-white/60 dark:border-stone-700/60 shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center transition-colors">


          <div className="flex items-center gap-2 sm:gap-3">
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
              className="p-2 rounded-full bg-white/60 dark:bg-stone-800/60 border border-white/60 dark:border-stone-700/60 shadow-sm hover:shadow-md text-stone-700 dark:text-stone-300 transition-all"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button onClick={() => setShowPrintModal(true)} className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 bg-white/60 dark:bg-stone-800/60 px-3 py-1.5 rounded-full border border-white/60 dark:border-stone-700/60 shadow-sm hover:shadow-md transition-all">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={() => exportToCSV(habits, checkins)} className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 bg-white/60 dark:bg-stone-800/60 px-3 py-1.5 rounded-full border border-white/60 dark:border-stone-700/60 shadow-sm hover:shadow-md transition-all">
              <Download className="w-4 h-4" /> CSV
            </button>

             <button 
              onClick={() => signOut(auth)} 
              className="flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800 shadow-sm hover:shadow-md transition-all"
            >
               Logout
            </button>
            <a
              href="https://github.com/uusaff"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-100 dark:text-stone-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors bg-white/60 dark:bg-stone-800/60 px-4 py-1.5 rounded-full border border-white/60 dark:border-stone-700/60 shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
                <path d="M9 18c-4.5 1.6-5-2.5-5-3"></path>
              </svg>
              uusaff
            </a>
          </div>
        </header>

        {/* BACKGROUND DECORATIONS */}
        <div className="absolute top-0 -left-24 w-72 h-72 bg-teal-300/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-orange-300/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-64 h-64 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
        <Leaf className="absolute -top-8 -left-8 w-40 h-40 text-emerald-700/[0.07] rotate-[20deg] pointer-events-none" />
        <Leaf className="absolute bottom-16 -right-10 w-52 h-52 text-emerald-700/[0.07] -rotate-[35deg] pointer-events-none" />
        <Leaf className="absolute top-1/2 left-[8%] w-20 h-20 text-teal-700/[0.06] rotate-[150deg] pointer-events-none hidden sm:block" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-amber-200/40 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-xl shadow-lg shadow-teal-200/60">
              🌴
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-white tracking-tight">Daily Progress</h1>
              <p className="text-stone-500 text-sm">Stay consistent, stay tropical.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl shadow-lg shadow-emerald-100/50 dark:shadow-black/40 p-5 sm:p-6 mb-6 flex flex-wrap items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md">
              {profile.name ? profile.name.trim()[0].toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="font-semibold text-stone-800 dark:text-white">{profile.name || 'Add your name'}</p>
              <div className="flex flex-wrap gap-3 text-xs text-stone-500 mt-1">
                {profile.age && <span>{profile.age} yrs</span>}
                {profile.weight && <span>{profile.weight} kg</span>}
                {profile.height && <span>{profile.height} cm</span>}
                {!profile.age && !profile.weight && !profile.height && <span>Tap edit to set up your profile</span>}
              </div>
            </div>
            <button
              onClick={openProfileForm}
              className="flex items-center gap-1 text-sm font-medium text-teal-700 bg-white/70 px-3 py-1.5 rounded-full border border-white/70 shadow-sm hover:shadow-md transition-shadow shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </motion.div>

          {/* PROFILE MODAL */}
          <AnimatePresence>
            {showProfileForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowProfileForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-3xl shadow-2xl p-6 w-full max-w-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-stone-800 dark:text-white">Your Profile</h3>
                    <button onClick={() => setShowProfileForm(false)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="Name"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        value={pAge}
                        onChange={(e) => setPAge(e.target.value)}
                        type="number"
                        placeholder="Age"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                      <input
                        value={pWeight}
                        onChange={(e) => setPWeight(e.target.value)}
                        type="number"
                        placeholder="Weight kg"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                      <input
                        value={pHeight}
                        onChange={(e) => setPHeight(e.target.value)}
                        type="number"
                        placeholder="Height cm"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button onClick={() => setShowProfileForm(false)} className="text-sm text-stone-500 px-3 py-1.5">
                      Cancel
                    </button>
                    <button onClick={saveProfile} className="text-sm font-medium text-white bg-teal-500 px-4 py-1.5 rounded-full">
                      Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PRINT WALA MODAL */}
          <AnimatePresence>
            {showPrintModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center p-4 print:hidden"
                onClick={() => setShowPrintModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-white/70 dark:border-white/10 rounded-3xl shadow-2xl p-6 w-full max-w-xs"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-stone-800 dark:text-white flex items-center gap-2">
                      <Printer className="w-5 h-5" /> Print Settings
                    </h3>
                    <button onClick={() => setShowPrintModal(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Select Month</label>
                      <select
                        value={selectedPrintMonth}
                        onChange={(e) => setSelectedPrintMonth(parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer"
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                          <option key={m} value={i}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-5">
                    <button onClick={() => setShowPrintModal(false)} className="text-sm text-stone-500 dark:text-stone-400 px-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleGeneratePrint}
                      className="text-sm font-medium text-white bg-teal-500 px-4 py-1.5 rounded-full shadow hover:shadow-md transition-shadow"
                    >
                      Generate Print
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STATS SECTION */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard icon={Check} label="Total Check-ins" value={totalCheckins} color="teal" />
            <StatCard icon={Flame} label="Current Streak" value={`${currentStreak}d`} color="orange" />
            <StatCard icon={Award} label="Best Streak Ever" value={`${bestStreakEver}d`} color="rose" />
            <StatCard icon={Target} label="Monthly Rate" value={`${monthlyRate}%`} color="sky" />
          </div>

          <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl shadow-lg shadow-orange-100/50 dark:shadow-black/40 p-5 sm:p-6 mb-6 flex items-start gap-3">
            <QuoteIcon className="w-5 h-5 text-orange-400 shrink-0 mt-1" />
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="text-stone-700 dark:text-stone-200 italic font-medium leading-relaxed"
              >
                "{QUOTES[quoteIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl border border-white/60 dark:border-white/100 rounded-3xl shadow-lg shadow-teal-100/50 dark:shadow-black/40 p-6 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 132 132">
                  <circle cx="66" cy="66" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="12" />
                  <motion.circle
                    cx="66" cy="66" r={radius} fill="none"
                    stroke={pct >= 100 ? '#22c55e' : '#fb923c'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-stone-800 dark:text-white">{pct}%</span>
                  <span className="text-xs text-stone-500">{todayChecked}/{totalHabits} done</span>
                </div>
              </div>
              <div className="w-full mt-5">
                <div className="h-2.5 w-full bg-stone-200/60 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-center text-xs text-stone-500 mt-2">Today's progress</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl shadow-lg shadow-teal-100/50 dark:shadow-black/40 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-white/50 rounded-full p-1">
                  <button
                    onClick={() => setViewMode('weekly')}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${viewMode === 'weekly' ? 'bg-teal-500 text-white shadow' : 'text-stone-500 hover:text-stone-700'
                      }`}
                  >
                    <TrendingUp className="w-4 h-4" /> Weekly
                  </button>
                  <button
                    onClick={() => setViewMode('monthly')}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${viewMode === 'monthly' ? 'bg-teal-500 text-white shadow' : 'text-stone-500 hover:text-stone-700'
                      }`}
                  >
                    <Calendar className="w-4 h-4" /> Monthly
                  </button>
                </div>
                <button
                  onClick={() => setShowAddForm((s) => !s)}
                  className="flex items-center gap-1 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-1.5 rounded-full shadow hover:shadow-md transition-shadow"
                >
                  <Plus className="w-4 h-4" /> Habit
                </button>
              </div>

              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/70 space-y-3">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Habit name..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                      <div className="flex flex-wrap gap-2">
                        {ICON_KEYS.map((key) => {
                          const Icon = ICONS[key];
                          return (
                            <button
                              key={key}
                              onClick={() => setNewIcon(key)}
                              className={`p-2 rounded-xl border ${newIcon === key ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        {COLOR_KEYS.map((key) => (
                          <button
                            key={key}
                            onClick={() => setNewColor(key)}
                            className={`w-7 h-7 rounded-full bg-gradient-to-br ${COLORS[key].grad} ${newColor === key ? 'ring-2 ring-offset-2 ring-stone-400' : ''}`}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setNewCategory(cat)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${newCategory === cat ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={cancelForm} className="text-sm text-stone-500 px-3 py-1.5">
                          Cancel
                        </button>
                        <button onClick={saveHabit} className="text-sm font-medium text-white bg-teal-500 px-4 py-1.5 rounded-full">
                          {editingHabitId ? 'Save' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WEEKLY VIEW */}
              {viewMode === 'weekly' && (
                <>
                  <div className="flex items-center gap-1 sm:gap-2 mb-2 px-1">
                    <div className={`${LABEL_WIDTH} shrink-0`} />
                    {weekDates.map((d, i) => {
                      const isToday = dateKey(d) === todayKey;
                      return (
                        <div key={i} className="flex-1 text-center">
                          <div className={`text-[10px] sm:text-xs font-medium ${isToday ? 'text-teal-600' : 'text-stone-400'}`}>
                            {DAY_LABELS[i]}
                          </div>
                          <div className={`text-[10px] sm:text-xs ${isToday ? 'text-teal-600 font-bold' : 'text-stone-400'}`}>
                            {d.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    {CATEGORIES.map((cat) => {
                      const catHabits = habitsByCategory[cat];
                      if (!catHabits || catHabits.length === 0) return null;
                      return (
                        <div key={cat}>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400 mb-1.5 px-1">{cat}</p>
                          <div className="space-y-2">
                            <AnimatePresence>
                              {catHabits.map((habit) => {
                                const Icon = ICONS[habit.icon] || Footprints;
                                const color = COLORS[habit.color] || COLORS.teal;
                                const streak = getStreak(habit.id);
                                return (
                                  <motion.div
                                    key={habit.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center gap-1 sm:gap-2 bg-white/50 dark:bg-stone-700/40 rounded-2xl px-2 py-2 group"
                                  >
                                    <div className={`${LABEL_WIDTH} shrink-0 flex items-center gap-2 min-w-0 pr-1`}>
                                      <div className={`w-8 h-8 rounded-xl ${color.light} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-4 h-4 ${color.text}`} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-stone-700 dark:text-stone-100 truncate max-w-[90px] sm:max-w-[140px] leading-tight">{habit.name}</p>
                                        {streak > 0 && (
                                          <p className="text-[10px] text-orange-500 flex items-center gap-0.5 mt-0.5">
                                            <Flame className="w-3 h-3" /> {streak} day{streak > 1 ? 's' : ''}
                                          </p>
                                        )}
                                      </div>

                                      <div className="ml-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                                        <button onClick={() => openEditForm(habit)} className="text-stone-300 hover:text-teal-500 transition-colors p-1">
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => deleteHabit(habit.id)} className="text-stone-300 hover:text-rose-400 transition-colors p-1">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                    {weekDates.map((d, i) => {
                                      const k = dateKey(d);
                                      const entry = getEntry(checkins, k, habit.id);
                                      const isFuture = k > todayKey;
                                      return (
                                        <div key={i} className="flex-1 flex justify-center">
                                          <CheckinCell
                                            status={entry.status}
                                            note={entry.note}
                                            color={color}
                                            isFuture={isFuture}
                                            onToggle={() => toggleCheckin(habit.id, k)}
                                            onNote={() => setCheckinNote(habit.id, k)}
                                          />
                                        </div>
                                      );
                                    })}
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                    {habits.length === 0 && (
                      <p className="text-center text-sm text-stone-400 py-6">No habits yet — add one to get started 🌱</p>
                    )}
                  </div>
                </>
              )}

              {/* MONTHLY VIEW */}
              {viewMode === 'monthly' && (
                <div>
                  <div className="overflow-x-auto -mx-1 pb-2">
                    <div className="min-w-max px-1">
                      <div className="flex items-center gap-1 mb-2">
                        <div className={`${LABEL_WIDTH} shrink-0`} />
                        {monthDates.map((d) => {
                          const isToday = dateKey(d) === todayKey;
                          return (
                            <div
                              key={d.getDate()}
                              className={`w-6 text-center text-[10px] font-medium shrink-0 ${isToday ? 'text-teal-600 font-bold' : 'text-stone-400'
                                }`}
                            >
                              {d.getDate()}
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-4">
                        {CATEGORIES.map((cat) => {
                          const catHabits = habitsByCategory[cat];
                          if (!catHabits || catHabits.length === 0) return null;
                          return (
                            <div key={cat}>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-1 px-1">{cat}</p>
                              <div className="space-y-2">
                                {catHabits.map((habit) => {
                                  const Icon = ICONS[habit.icon] || Footprints;
                                  const color = COLORS[habit.color] || COLORS.teal;
                                  const count = habitMonthlyCount(habit.id);
                                  const habitPct = monthTotalDays === 0 ? 0 : Math.round((count / monthTotalDays) * 100);
                                  return (
                                    <div key={habit.id} className="flex items-center gap-1 bg-white/50 dark:bg-stone-700/40 rounded-2xl px-2 py-2">
                                      <div className={`${LABEL_WIDTH} shrink-0 flex items-center gap-2 min-w-0 pr-1`}>
                                        <div className={`w-8 h-8 rounded-xl ${color.light} flex items-center justify-center shrink-0`}>
                                          <Icon className={`w-4 h-4 ${color.text}`} />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-stone-700 dark:text-stone-100 truncate">{habit.name}</p>
                                          <p className="text-[10px] text-stone-400">{count}/{monthTotalDays} · {habitPct}%</p>
                                        </div>
                                      </div>
                                      {monthDates.map((d) => {
                                        const k = dateKey(d);
                                        const entry = getEntry(checkins, k, habit.id);
                                        const isFuture = k > todayKey;
                                        return (
                                          <CheckinCell
                                            key={k}
                                            status={entry.status}
                                            note={entry.note}
                                            color={color}
                                            isFuture={isFuture}
                                            size="sm"
                                            shape="square"
                                            onToggle={() => toggleCheckin(habit.id, k)}
                                            onNote={() => setCheckinNote(habit.id, k)}
                                          />
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {habits.length === 0 && (
                          <p className="text-center text-sm text-stone-400 py-6">No habits yet — add one to get started 🌱</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {habits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-stone-200/60 text-xs">
                      <span className="bg-white/60 px-3 py-1.5 rounded-full text-stone-600">
                        <strong className="text-stone-800 dark:text-white">{monthlyCompleted}</strong> total check-ins this month
                      </span>
                      <span className="bg-white/60 px-3 py-1.5 rounded-full text-stone-600">
                        Monthly completion: <strong className="text-stone-800 dark:text-white">{monthlyRate}%</strong>
                      </span>
                      {bestHabit && (
                        <span className="bg-white/60 px-3 py-1.5 rounded-full text-stone-600">
                          Best habit: <strong className="text-stone-800 dark:text-white">{bestHabit.habit.name}</strong> ({bestHabit.count}/{monthTotalDays})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* WEB WALA COPYRIGHT FOOTER */}
          <div className="mt-10 border-t border-stone-200/50 dark:border-stone-700/50 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-medium tracking-wide">
            <p>© {new Date().getFullYear()} M Yousaf. All Rights Reserved.</p>
            <p className="flex items-center gap-1">® Trademark Registered</p>
          </div>

        </motion.div>
      </div>

      {/* PRINT VIEW COMPONENT (End mein) */}
      <PrintView habits={habits} year={printYear} month={printMonth} />
    </>
  );
}

function AdminDashboard({ handleSignOut }) {
  const [allUsers, setAllUsers] = React.useState([]);

  React.useEffect(() => {
    const fetchAllData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        setAllUsers(usersData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800">Admin Dashboard</h1>
          <button onClick={handleSignOut} className="bg-rose-500 text-white px-4 py-2 rounded-lg">Logout</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h2 className="text-xl font-semibold mb-4">Total Users: {allUsers.length}</h2>
          {allUsers.map((u, i) => (
            <div key={u.id} className="border-b py-3 flex justify-between">
              <span className="font-medium text-stone-700">{u.profileData?.name || `User ${i+1}`}</span>
              <span className="text-stone-500">Habits Tracked: {u.trackerData?.habits?.length || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}