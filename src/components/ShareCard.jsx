import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

export default function ShareCard({ habits, checkins, profile, weeklySummary, currentStreak, totalCheckins }) {
  const [copied, setCopied] = useState(false);

  const generateText = () => {
    const lines = [];
    const name = profile?.name?.split(' ')[0] || 'Habit Tracker';
    lines.push(`📊 ${name}'s Habit Report`);
    lines.push(`━━━━━━━━━━━━━━━━`);
    if (currentStreak > 0) lines.push(`🔥 Best Streak: ${currentStreak} days`);
    lines.push(`✅ Total Check-ins: ${totalCheckins}`);
    if (weeklySummary) lines.push(`📈 This Week: ${weeklySummary.rate}% complete (${weeklySummary.checked}/${weeklySummary.total})`);
    lines.push(``);
    lines.push(`🏆 Habits:`);
    habits.slice(0, 5).forEach((h) => {
      const count = Object.keys(checkins).filter((dk) => {
        const e = checkins[dk]?.[h.id];
        return e && (e === true || e.status === 'checked');
      }).length;
      lines.push(`  ${h.icon || '•'} ${h.name}: ${count}x`);
    });
    lines.push(``);
    lines.push(`Built with discipline 💪`);
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = generateText();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div className="bg-white/40 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-xl p-3 sm:p-4 mb-3 font-mono text-[10px] sm:text-xs leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
        {generateText()}
      </div>
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-bold hover:opacity-90 transition-all shadow-lg"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Copied!
            </motion.span>
          ) : (
            <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
              <Copy className="w-4 h-4" /> Copy Progress Report
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
