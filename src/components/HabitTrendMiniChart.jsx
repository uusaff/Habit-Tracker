import { useMemo } from 'react';
import { motion } from 'framer-motion';

function dateKey(d) {
  const p = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const BAR_COLORS = { teal: 'bg-teal-500', sky: 'bg-sky-500', emerald: 'bg-emerald-500', orange: 'bg-orange-500', rose: 'bg-rose-500', purple: 'bg-purple-500', amber: 'bg-amber-400' };

export default function HabitTrendMiniChart({ habitId, checkins, days = 28, colorKey = 'teal', isLoading }) {
  const barColor = BAR_COLORS[colorKey] || 'bg-teal-500';

  const bars = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dk = dateKey(d);
      const e = checkins[dk]?.[habitId];
      const checked = e && (e === true || e.status === 'checked');
      result.push({ day: dk, checked });
    }
    return result;
  }, [habitId, checkins, days]);

  const checkedCount = bars.filter((b) => b.checked).length;
  const rate = Math.round((checkedCount / days) * 100);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="flex gap-[1px]">
          {Array.from({ length: 28 }, (_, i) => (
            <div key={i} className="flex-1 h-8 bg-stone-100 dark:bg-stone-800 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-[1px] h-8 mb-1.5">
        {bars.map((b, i) => (
          <div key={b.day} className="flex-1 flex items-end justify-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: b.checked ? '100%' : '15%' }}
              transition={{ duration: 0.3, delay: i * 0.008 }}
              className={`w-full rounded-sm ${b.checked ? barColor : 'bg-stone-100 dark:bg-stone-800'}`}
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
        {checkedCount}/{days} days ({rate}%)
      </p>
    </div>
  );
}