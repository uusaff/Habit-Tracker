import { motion } from 'framer-motion';

const MILESTONE_NAMES = { 7: 'Week', 14: 'Fortnight', 21: '3 Weeks', 30: 'Month', 60: '2 Months', 90: 'Quarter', 365: 'Year' };

export default function ProjectedStreak({ currentStreak = 0, avgRate = 0, nextMilestones = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-20 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-3 w-40 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (currentStreak === 0) {
    return (
      <div className="text-sm text-stone-400 font-medium">
        Start a streak to see projections
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <motion.span
          key={currentStreak}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-black text-stone-800 dark:text-white"
        >
          {currentStreak}
        </motion.span>
        <span className="text-sm font-semibold text-stone-400">day streak</span>
      </div>

      <p className="text-xs text-stone-500 mb-3">
        {avgRate}% consistency rate
      </p>

      {nextMilestones.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Upcoming Milestones</p>
          {nextMilestones.map((m) => {
            const pct = Math.min((currentStreak / m.milestone) * 100, 100);
            const name = MILESTONE_NAMES[m.milestone] || `${m.milestone} Days`;
            return (
              <div key={m.milestone} className="relative">
                <div className="flex justify-between text-[10px] font-semibold mb-0.5">
                  <span className="text-stone-600 dark:text-stone-300">{name}</span>
                  <span className="text-teal-600 dark:text-teal-400">
                    {m.eta > 0 ? `${m.eta}d` : 'Due'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-teal-500'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
