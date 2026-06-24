import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Footprints, BookOpen, Moon, Leaf, Dumbbell, Droplet, Brain, Heart,
  Music, Camera, Coffee, PenLine, Plus, Trash2, Check,
  Quote as QuoteIcon, Flame, TrendingUp
} from 'lucide-react';

const STORAGE_KEY = 'tropical-habit-tracker-v1';

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
  'Habits are the compound interest of self-improvement.',
  'Do something today that your future self will thank you for.',
  'Success is the sum of small efforts repeated daily.',
  'Discipline is the bridge between goals and accomplishment.',
  'Every action you take is a vote for the person you wish to become.',
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
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function useTrackerStorage() {
  const [data, setData] = useState(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    try {
      // Use standard browser localStorage instead of window.storage
      const res = localStorage.getItem(STORAGE_KEY);
      setData(res ? JSON.parse(res) : DEFAULT_DATA);
    } catch (e) {
      setData(DEFAULT_DATA);
    } finally {
      loadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current || data === null) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Could not save tracker data', e);
    }
  }, [data]);

  return [data, setData];
}

export default function HabitTracker() {
  const [data, setData] = useTrackerStorage();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Footprints');
  const [newColor, setNewColor] = useState('teal');

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const weekDates = useMemo(() => getWeekDates(), []);
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-orange-50 to-amber-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const { habits, checkins } = data;

  const toggleCheckin = (habitId, dKey) => {
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
    setNewIcon('Footprints');
    setNewColor('teal');
    setShowAddForm(false);
  };

  const deleteHabit = (id) => {
    setData((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== id) }));
  };

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
      
      {/* Top GitHub Header */}
      <header className="relative z-20 w-full bg-white/40 backdrop-blur-xl border-b border-white/60 shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center">
        <span className="font-bold text-stone-700 tracking-wide text-sm sm:text-base">Habit Tracker</span>
        <a
          href="https://github.com/uusaff"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-teal-600 transition-colors bg-white/60 px-4 py-1.5 rounded-full border border-white/60 shadow-sm hover:shadow-md"
        >
          {/* Replaced Lucide Github icon with inline SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
            <path d="M9 18c-4.5 1.6-5-2.5-5-3"></path>
          </svg>
          uusaff
        </a>
      </header>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 -left-24 w-72 h-72 bg-teal-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-orange-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />

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
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 tracking-tight">Daily Progress</h1>
            <p className="text-stone-500 text-sm">Stay consistent, stay tropical.</p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-orange-100/50 p-5 sm:p-6 mb-6 flex items-start gap-3">
          <QuoteIcon className="w-5 h-5 text-orange-400 shrink-0 mt-1" />
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="text-stone-700 italic font-medium leading-relaxed"
            >
              "{QUOTES[quoteIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-teal-100/50 p-6 flex flex-col items-center justify-center">
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
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-center text-xs text-stone-500 mt-2">Today's progress</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-teal-100/50 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-500" /> This Week
              </h2>
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
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
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
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setShowAddForm(false)} className="text-sm text-stone-500 px-3 py-1.5">
                        Cancel
                      </button>
                      <button onClick={addHabit} className="text-sm font-medium text-white bg-teal-500 px-4 py-1.5 rounded-full">
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            <div className="space-y-2">
              <AnimatePresence>
                {habits.map((habit) => {
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
                      className="flex items-center gap-1 sm:gap-2 bg-white/50 rounded-2xl px-2 py-2 group"
                    >
                      <div className={`${LABEL_WIDTH} shrink-0 flex items-center gap-2 min-w-0 pr-1`}>
                        <div className={`w-8 h-8 rounded-xl ${color.light} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-4 h-4 ${color.text}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-700 truncate">{habit.name}</p>
                          {streak > 0 && (
                            <p className="text-[10px] text-orange-500 flex items-center gap-0.5">
                              <Flame className="w-3 h-3" /> {streak} day{streak > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-rose-400 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {weekDates.map((d, i) => {
                        const k = dateKey(d);
                        const checked = !!checkins[k]?.[habit.id];
                        
                        // Validation logic check: is the date strictly greater than today's string format
                        const isFuture = k > todayKey; 
                        
                        return (
                          <div key={i} className="flex-1 flex justify-center">
                            <motion.button
                              disabled={isFuture}
                              whileTap={!isFuture ? { scale: 0.85 } : {}}
                              onClick={() => !isFuture && toggleCheckin(habit.id, k)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isFuture
                                  ? 'border-stone-100 bg-stone-50/50 cursor-not-allowed opacity-50'
                                  : checked
                                  ? `${color.solid} border-transparent`
                                  : 'border-stone-200 bg-white hover:border-stone-300 cursor-pointer'
                              }`}
                            >
                              <AnimatePresence>
                                {checked && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                  >
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </div>
                        );
                      })}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {habits.length === 0 && (
                <p className="text-center text-sm text-stone-400 py-6">No habits yet — add one to get started 🌱</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}