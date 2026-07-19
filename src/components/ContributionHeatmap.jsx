import { useMemo } from 'react';
import { motion } from 'framer-motion';

const CELL_SIZE = 12;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function ContributionHeatmap({
  data = {},
  startDate,
  endDate,
  maxCount = 1,
  isLoading,
  emptyMessage = 'No activity recorded',
  className = '',
}) {
  const weeks = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    const pad = start.getDay();
    const padded = Array.from({ length: pad }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() - (pad - i));
      return d;
    }).concat(days);
    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
    return weeks;
  }, [startDate, endDate]);

  const getIntensity = (value) => {
    if (!value) return 'bg-stone-100 dark:bg-stone-800';
    const ratio = value / Math.max(maxCount, 1);
    if (ratio < 0.25) return 'bg-teal-200 dark:bg-teal-950';
    if (ratio < 0.5) return 'bg-teal-300 dark:bg-teal-900';
    if (ratio < 0.75) return 'bg-teal-400 dark:bg-teal-700';
    return 'bg-teal-500 dark:bg-teal-500';
  };

  const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (isLoading) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex gap-[2px] animate-pulse">
          {Array.from({ length: 53 }, (_, i) => (
            <div key={i} className="flex flex-col gap-[2px]">
              {Array.from({ length: 7 }, (_, j) => (
                <div key={j} className="w-[12px] h-[12px] rounded-sm bg-stone-100 dark:bg-stone-800" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 text-sm text-stone-400 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex gap-[2px]">
        <div className="flex flex-col gap-[2px] mr-1 pt-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[12px] text-[8px] font-medium text-stone-400 flex items-center" style={{ lineHeight: '12px' }}>
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map((day, di) => {
              const dk = dateKey(day);
              const count = data[dk] || 0;
              const today = new Date();
              const isToday = dk === dateKey(today);
              return (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.001, duration: 0.2 }}
                  title={`${dk}: ${count > 0 ? `${count} check${count > 1 ? 's' : ''}` : 'No activity'}`}
                  className={`w-[${CELL_SIZE}px] h-[${CELL_SIZE}px] rounded-sm ${getIntensity(count)} ${isToday ? 'ring-2 ring-teal-400' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 mt-1.5">
        <span className="text-[8px] font-medium text-stone-400">Less</span>
        <div className="w-[10px] h-[10px] rounded-sm bg-stone-100 dark:bg-stone-800" />
        <div className="w-[10px] h-[10px] rounded-sm bg-teal-200 dark:bg-teal-950" />
        <div className="w-[10px] h-[10px] rounded-sm bg-teal-300 dark:bg-teal-900" />
        <div className="w-[10px] h-[10px] rounded-sm bg-teal-400 dark:bg-teal-700" />
        <div className="w-[10px] h-[10px] rounded-sm bg-teal-500 dark:bg-teal-500" />
        <span className="text-[8px] font-medium text-stone-400">More</span>
      </div>
    </div>
  );
}
