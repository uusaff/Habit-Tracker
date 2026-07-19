import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, ChevronRight, Flame } from 'lucide-react';

function dateKey(d) {
  const p = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const CHALLENGES = [
  { id: 'daily_all', label: 'Complete ALL habits every day', req: 7, type: 'daily' },
  { id: 'streak_7', label: '7-day streak on any habit', req: 7, type: 'streak' },
  { id: 'streak_14', label: '14-day streak on any habit', req: 14, type: 'streak' },
  { id: 'checkins_30', label: '30 check-ins this week', req: 30, type: 'weekly' },
  { id: 'checkins_50', label: '50 check-ins this week', req: 50, type: 'weekly' },
];

export default function WeeklyChallenge({ habits, checkins, weekDates, todayKey, isLoading }) {
  const [activeChallenge, setActiveChallenge] = useState(() => {
    try { return JSON.parse(localStorage.getItem('activeChallenge') || 'null'); }
    catch { return null; }
  });

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completedChallenges') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('activeChallenge', JSON.stringify(activeChallenge));
  }, [activeChallenge]);

  useEffect(() => {
    localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  const weekChecked = {};
  weekDates.forEach((d) => {
    const dk = dateKey(d);
    if (dk > todayKey) return;
    let count = 0;
    habits.forEach((h) => {
      const e = checkins[dk]?.[h.id];
      if (e && (e === true || e.status === 'checked')) count++;
    });
    weekChecked[dk] = count;
  });
  const totalWeekCheckins = Object.values(weekChecked).reduce((a, b) => a + b, 0);
  const totalHabits = habits.length;
  const perfectDays = Object.values(weekChecked).filter((c) => c === totalHabits).length;

  const getProgress = (challenge) => {
    if (challenge.type === 'daily') return Math.min(perfectDays, challenge.req);
    if (challenge.type === 'streak') return Math.min(Math.max(...habits.map((h) => getStreakInternal(h.id, checkins, todayKey)), 0), challenge.req);
    return Math.min(totalWeekCheckins, challenge.req);
  };

  const progress = activeChallenge ? getProgress(activeChallenge) : 0;
  const pct = activeChallenge ? Math.min((progress / activeChallenge.req) * 100, 100) : 0;

  const claimReward = () => {
    if (!activeChallenge || pct < 100) return;
    setCompletedChallenges((prev) => {
      if (prev.find((c) => c.id === activeChallenge.id)) return prev;
      return [...prev, { ...activeChallenge, completedAt: new Date().toISOString() }];
    });
    setActiveChallenge(null);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-32 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-10 bg-stone-200 dark:bg-stone-700 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeChallenge ? (
        <div className="relative overflow-hidden rounded-xl bg-white/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest">Active Challenge</span>
            </div>
            <button onClick={() => setActiveChallenge(null)} className="text-[10px] font-semibold text-stone-400 hover:text-rose-500 transition-colors">Abandon</button>
          </div>
          <p className="text-sm font-bold text-stone-800 dark:text-white mb-2">{activeChallenge.label}</p>
          <div className="w-full h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden mb-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">{progress}/{activeChallenge.req}</span>
            {pct >= 100 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={claimReward}
                className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/25"
              >
                <Trophy className="w-3 h-3" /> Claim
              </motion.button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Start a Challenge</p>
          {CHALLENGES.filter((c) => !completedChallenges.find((cc) => cc.id === c.id)).slice(0, 3).map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChallenge(ch)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-stone-800/40 hover:bg-white dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">{ch.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </button>
          ))}
          {completedChallenges.length > 0 && (
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {completedChallenges.length} challenge{completedChallenges.length > 1 ? 's' : ''} completed
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function getStreakInternal(habitId, checkins, todayKey) {
  let streak = 0;
  const today = new Date(todayKey + 'T00:00:00');
  const cursor = new Date(today);
  for (let i = 0; i < 365; i++) {
    const dk = dateKey(cursor);
    const e = checkins[dk]?.[habitId];
    if (e && (e === true || e.status === 'checked')) streak++;
    else if (e && e.status === 'skipped') { streak++; }
    else break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
