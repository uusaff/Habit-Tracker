import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Footprints, BookOpen, Moon, Leaf, Dumbbell, Droplet, Brain, Heart,
  Music, Camera, Coffee, PenLine, Plus, Trash2, Check,
  Quote as QuoteIcon, Flame, TrendingUp, Github, Calendar, CalendarDays, Lock
} from 'lucide-react';

const STORAGE_KEY = 'tropical-habit-tracker-v2';

const ICONS = { Footprints, BookOpen, Moon, Leaf, Dumbbell, Droplet, Brain, Heart, Music, Camera, Coffee, PenLine };
const ICON_KEYS = Object.keys(ICONS);

const COLORS = {
  teal:   { grad: 'from-teal-400 to-cyan-400',     solid: 'bg-teal-500',    light: 'bg-teal-50',    text: 'text-teal-600' },
  orange: { grad: 'from-orange-400 to-amber-400',  solid: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600' },
  green:  { grad: 'from-emerald-400 to-green-500', solid: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
  sand:   { grad: 'from-amber-300 to-yellow-400',  solid: 'bg-amber-400',   light: 'bg-amber-50',   text: 'text-amber-600' },
  rose:   { grad: 'from-rose-400 to-pink-400',     solid: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-600' },
  sky:    { grad: 'from-sky-400 to-blue-400',      solid: 'bg-sky-500',     light: 'bg-sky-50',     text: 'text-sky-600' },
};
const COLOR_KEYS = Object.keys(COLORS);

const QUOTES = [
  'Discipline is choosing between what you want now and what you want most.',
  'Small daily improvements lead to staggering long-term results.',
  'Motivation gets you started. Discipline keeps you going.',
  "You don't have to be extreme, just consistent.",
  'The pain of discipline weighs ounces; the pain of regret weighs tons.',
];

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Daily Steps', icon: 'Footprints', color: 'teal' },
  { id: 'h2', name: 'Research Hours', icon: 'BookOpen', color: 'orange' },
  { id: 'h3', name: 'Sleep Tracking', icon: 'Moon', color: 'sky' },
  { id: 'h4', name: 'Nature Exposure', icon: 'Leaf', color: 'green' },
];

const DEFAULT_DATA = { habits: DEFAULT_HABITS, checkins: {} };

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

function getMonthDates(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function useTrackerStorage() {
  const [data, setData] = useState(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (window.storage) {
          const res = await window.storage.get(STORAGE_KEY);
          if (mounted) setData(res ? JSON.parse(res.value) : DEFAULT_DATA);
        } else if (mounted) {
          const local = localStorage.getItem(STORAGE_KEY);
          setData(local ? JSON.parse(local) : DEFAULT_DATA);
        }
      } catch (e) {
        if (mounted) setData(DEFAULT_DATA);
      } finally {
        loadedRef.current = true;
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!loadedRef.current || data === null) return;
    (async () => {
      try {
        if (window.storage) {
          await window.storage.set(STORAGE_KEY, JSON.stringify(data));
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } catch (e) {
        console.error('Could not save tracker data', e);
      }
    })();
  }, [data]);

  return [data, setData];
}

export default function HabitTracker() {
  const [data, setData] = useTrackerStorage();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Footprints');
  const [newColor, setNewColor] = useState('teal');

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const weekDates = useMemo(() => getWeekDates(), []);
  const monthDates = useMemo(() => getMonthDates(today.getFullYear(), today.getMonth()), [today]);

  // Calendar Header Data
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = today.toLocaleDateString('en-US', { month: 'long' });
  const dateNum = today.getDate();
  const yearNum = today.getFullYear();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-orange-50 to-amber-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }} className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { habits, checkins } = data;

  const toggleCheckin = (habitId, dKey) => {
    // 🛑 STRICT VALIDATION: Agar click hone wali date aaj ki nahi hai, toh alert dikhao aur return kar jao.
    if (dKey !== todayKey) {
      alert("Validation Locked: You can only update habits for the CURRENT active date.");
      return;
    }

    setData((prev) => {
      const day = prev.checkins[dKey] || {};
      const next = { ...day, [habitId]: !day[habitId] };
      return { ...prev, checkins: { ...prev.checkins, [dKey]: next } };
    });
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    const id = 'h' + Date.now();
    setData((prev) => ({
      ...prev,
      habits: [...prev.habits, { id, name: newName.trim(), icon: newIcon, color: newColor }],
    }));
    setNewName('');
    setShowAddForm(false);
  };

  const deleteHabit = (id) => setData((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== id) }));

  const todayChecked = habits.filter((h) => checkins[todayKey]?.[h.id]).length;
  const totalHabits = habits.length;
  const pct = totalHabits === 0 ? 0 : Math.round((todayChecked / totalHabits) * 100);

  const getStreak = (habitId) => {
    let streak = 0;
    const cursor = new Date();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const k = dateKey(cursor);
      if (checkins[k]?.[habitId]) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const LABEL_WIDTH = 'w-32 sm:w-44';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-50 via-orange-50 to-amber-50 font-sans">
      
      {/* 🚀 NEW HEADER: Custom Name, GitHub & Full Date Sync */}
      <header className="relative z-50 w-full px-6 py-4 bg-white/40 backdrop-blur-md border-b border-white/50 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center shadow-md shadow-teal-200">
            <span className="text-white font-bold text-xl tracking-wider">Y</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight uppercase">Yousaf</h1>
            <a 
              href="https://github.com/uusaff" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
            >
              <Github className="w-4 h-4" /> @uusaff
            </a>
          </div>
        </div>
        
        <div className="flex flex-col items-center sm:items-end bg-white/60 px-4 py-2 rounded-2xl border border-white/60">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-lg">
            <Calendar className="w-5 h-5 text-teal-500" />
            <span>{dayName}, {monthName} {dateNum}</span>
          </div>
          <span className="text-sm font-medium text-stone-500 mr-1">{yearNum}</span>
        </div>
      </header>

      <div className="absolute top-20 -left-24 w-72 h-72 bg-teal-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-orange-300/40 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Progress Card */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-teal-100/50 p-6 flex flex-col items-center justify-center h-fit">
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
                <span className="text-3xl font-bold text-stone-800">{pct}%</span>
                <span className="text-xs text-stone-500">{todayChecked}/{totalHabits} done</span>
              </div>
            </div>
            <div className="w-full mt-5">
              <div className="h-2.5 w-full bg-stone-200/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-center text-xs text-stone-500 mt-2">Today's Progress</p>
            </div>
          </div>

          {/* Tracker Card */}
          <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-teal-100/50 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex bg-white/50 p-1 rounded-xl border border-white/60">
                <button 
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'week' ? 'bg-white shadow text-teal-600' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  <TrendingUp className="w-4 h-4" /> Week
                </button>
                <button 
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'month' ? 'bg-white shadow text-teal-600' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  <CalendarDays className="w-4 h-4" /> Month
                </button>
              </div>

              <button
                onClick={() => setShowAddForm((s) => !s)}
                className="flex items-center gap-1 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 rounded-full shadow hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" /> Add Habit
              </button>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                  <div className="bg-white/60 rounded-2xl p-4 border border-white/70 space-y-3">
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Habit name..." className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    <div className="flex flex-wrap gap-2">
                      {ICON_KEYS.map((key) => {
                        const Icon = ICONS[key];
                        return (
                          <button key={key} onClick={() => setNewIcon(key)} className={`p-2 rounded-xl border ${newIcon === key ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-stone-200 text-stone-500'}`}>
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setShowAddForm(false)} className="text-sm text-stone-500 px-3 py-1.5">Cancel</button>
                      <button onClick={addHabit} className="text-sm font-medium text-white bg-teal-500 px-4 py-1.5 rounded-full">Add</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WEEK VIEW HEADERS */}
            {viewMode === 'week' && (
              <div className="flex items-center gap-1 sm:gap-2 mb-2 px-1">
                <div className={`${LABEL_WIDTH} shrink-0`} />
                {weekDates.map((d, i) => {
                  const isToday = dateKey(d) === todayKey;
                  return (
                    <div key={i} className="flex-1 text-center">
                      <div className={`text-[10px] sm:text-xs font-medium ${isToday ? 'text-teal-600' : 'text-stone-400'}`}>{DAY_LABELS[i]}</div>
                      <div className={`text-[10px] sm:text-xs ${isToday ? 'text-teal-600 font-bold' : 'text-stone-400'}`}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence>
                {habits.map((habit) => {
                  const Icon = ICONS[habit.icon] || Footprints;
                  const color = COLORS[habit.color] || COLORS.teal;
                  const streak = getStreak(habit.id);
                  const displayDates = viewMode === 'week' ? weekDates : monthDates;

                  return (
                    <motion.div key={habit.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white/50 rounded-2xl p-3 border border-white/40 group">
                      
                      {/* Habit Info Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${color.light} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color.text}`} />
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-semibold text-stone-800">{habit.name}</p>
                            {streak > 0 && (
                              <p className="text-[11px] text-orange-500 flex items-center gap-1 font-medium">
                                <Flame className="w-3.5 h-3.5" /> {streak} day streak!
                              </p>
                            )}
                          </div>
                        </div>
                        <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-rose-400 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tracker Nodes */}
                      <div className={`flex ${viewMode === 'month' ? 'flex-wrap gap-1.5' : 'gap-1 sm:gap-2'}`}>
                        {displayDates.map((d, i) => {
                          const k = dateKey(d);
                          const checked = !!checkins[k]?.[habit.id];
                          const isToday = k === todayKey;
                          
                          // Strict logical check for visual rendering
                          const isLocked = !isToday; 

                          return (
                            <div key={i} className={`${viewMode === 'week' ? 'flex-1 flex justify-center' : ''}`}>
                              <button
                                onClick={() => toggleCheckin(habit.id, k)}
                                title={isLocked ? "Locked: Can only edit today" : "Tap to check-in"}
                                className={`
                                  relative flex items-center justify-center transition-all
                                  ${viewMode === 'week' ? 'w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2' : 'w-7 h-7 rounded-md border'}
                                  ${isLocked 
                                    ? (checked ? `${color.solid} border-transparent opacity-60 cursor-not-allowed` : 'border-stone-200 bg-stone-100/50 cursor-not-allowed')
                                    : (checked ? `${color.solid} border-transparent shadow-md transform scale-105` : 'border-stone-300 bg-white hover:border-teal-400')
                                  }
                                `}
                              >
                                {checked && !isLocked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                {checked && isLocked && <Check className="w-3 h-3 text-white/80" strokeWidth={3} />}
                                
                                {/* Show lock icon lightly on future/past un-checked dates */}
                                {!checked && isLocked && <Lock className="w-2.5 h-2.5 text-stone-300" />}
                                
                                {/* Date number overlay for month view */}
                                {viewMode === 'month' && !checked && !isLocked && (
                                  <span className="text-[10px] text-stone-400 font-medium">{d.getDate()}</span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}