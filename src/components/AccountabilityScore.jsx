import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Clock, Zap } from 'lucide-react';

export default function AccountabilityScore({ habits, checkins, today, isLoading }) {
  const score = useMemo(() => {
    if (habits.length === 0 || Object.keys(checkins).length === 0) return { overall: 0, consistency: 0, streak: 0, recovery: 0, totalDays: 0 };

    const todayKey = dateKey(today);
    let totalPossible = 0, totalChecked = 0, totalSkipped = 0;
    let currentStreakTotal = 0, longestStreak = 0;
    const habitStreaks = habits.map((h) => {
      let streak = 0, longest = 0;
      const sortedDays = Object.keys(checkins).filter((dk) => {
        const e = checkins[dk]?.[h.id];
        return e && (e === true || e.status === 'checked' || e.status === 'skipped');
      }).sort();
      for (let i = sortedDays.length - 1; i >= 0; i--) {
        const e = checkins[sortedDays[i]]?.[h.id];
        if (e && (e === true || e.status === 'checked')) streak++;
        else if (e && e.status === 'skipped') { streak++; }
        else break;
      }
      let runLen = 0;
      for (let i = 0; i < sortedDays.length; i++) {
        const e = checkins[sortedDays[i]]?.[h.id];
        if (e && (e === true || e.status === 'checked')) { runLen++; longest = Math.max(longest, runLen); }
        else if (e.status === 'skipped') { runLen++; }
        else runLen = 0;
      }
      return { streak, longest: Math.max(longest, runLen) };
    });

    habitStreaks.forEach((s) => { currentStreakTotal += s.streak; longestStreak = Math.max(longestStreak, s.longest); });

    const allDates = Object.keys(checkins).filter((dk) => dk <= todayKey).sort();
    allDates.forEach((dk) => {
      const entries = checkins[dk] || {};
      habits.forEach((h) => {
        const e = entries[h.id];
        if (!e) return;
        totalPossible++;
        if (e === true || e.status === 'checked') totalChecked++;
        else if (e.status === 'skipped') totalSkipped++;
      });
    });

    const consistency = totalPossible > 0 ? (totalChecked / totalPossible) * 100 : 0;
    const avgStreak = habits.length > 0 ? currentStreakTotal / habits.length : 0;
    const streakScore = Math.min((avgStreak / 30) * 100, 100);
    const recoveryRate = totalPossible > 0 ? ((totalChecked + totalSkipped) / totalPossible) * 100 : 0;
    const recoveryScore = Math.min((recoveryRate / 100) * 100, 100);
    const overall = Math.round((consistency * 0.5 + streakScore * 0.3 + recoveryScore * 0.2));

    return {
      overall: Math.min(overall, 100),
      consistency: Math.round(consistency),
      streak: Math.round(streakScore),
      recovery: Math.round(recoveryScore),
      totalDays: allDates.length,
    };
  }, [habits, checkins, today]);

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-stone-200 dark:bg-stone-700" />
        <div className="space-y-2">
          <div className="h-4 w-20 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-3 w-32 bg-stone-200 dark:bg-stone-700 rounded" />
        </div>
      </div>
    );
  }

  const grade = score.overall >= 90 ? 'A+' : score.overall >= 80 ? 'A' : score.overall >= 70 ? 'B' : score.overall >= 60 ? 'C' : score.overall >= 40 ? 'D' : 'F';
  const ringPct = score.overall / 100;
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - ringPct * circumference;

  const metrics = [
    { label: 'Consistency', value: `${score.consistency}%`, icon: TrendingUp, color: 'text-teal-500' },
    { label: 'Streak Power', value: `${score.streak}%`, icon: Zap, color: 'text-amber-500' },
    { label: 'Recovery', value: `${score.recovery}%`, icon: Clock, color: 'text-sky-500' },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" className="stroke-stone-200 dark:stroke-stone-700" strokeWidth="4" />
            <motion.circle
              cx="32" cy="32" r="28" fill="none"
              className="stroke-emerald-500"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-stone-800 dark:text-white">{grade}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-stone-700 dark:text-stone-300">Accountability Score</span>
          </div>
          <p className="text-2xl font-black text-stone-800 dark:text-white">{score.overall}/100</p>
          <p className="text-[10px] font-medium text-stone-400">{score.totalDays} days tracked</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="text-center p-2 rounded-lg bg-white/40 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-700">
            <m.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${m.color}`} />
            <p className="text-xs font-black text-stone-800 dark:text-white">{m.value}</p>
            <p className="text-[8px] font-medium text-stone-400 uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function dateKey(d) {
  const p = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
