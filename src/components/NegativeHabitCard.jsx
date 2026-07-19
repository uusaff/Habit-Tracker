import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, RotateCcw, TrendingUp } from 'lucide-react';

export default function NegativeHabitCard({
  habit,
  daysSinceLast = 0,
  longestStreak = 0,
  isLoading,
  error,
  onRelapse,
  onNotes,
}) {
  const [confirming, setConfirming] = useState(false);

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-8 w-16 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-3 w-32 bg-stone-200 dark:bg-stone-700 rounded" />
        </div>
      </div>
    );
  }

  const handleRelapse = async () => {
    setConfirming(false);
    onRelapse();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Flame className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{habit?.icon || '🔥'}</span>
          <div>
            <h3 className="font-bold text-stone-800 dark:text-white">{habit?.name || 'Habit'}</h3>
            <span className="text-xs font-medium text-rose-500">Vice Tracker</span>
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <motion.span
          key={daysSinceLast}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-black ${daysSinceLast === 0 ? 'text-rose-500' : 'text-stone-800 dark:text-white'}`}
        >
          {daysSinceLast}
        </motion.span>
        <span className="text-sm font-semibold text-stone-400">days clean</span>
      </div>

      <AnimatePresence>
        {daysSinceLast > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-3 text-xs font-medium text-stone-500 dark:text-stone-400 mb-4 overflow-hidden"
          >
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Best: {longestStreak} days</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={handleRelapse}
              className="flex-1 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/25"
            >
              Confirm Relapse
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 text-sm font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Relapse
            </button>
            {onNotes && (
              <button
                onClick={onNotes}
                className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 text-sm font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
              >
                Notes
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
