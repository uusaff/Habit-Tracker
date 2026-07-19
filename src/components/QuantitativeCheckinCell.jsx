import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus } from 'lucide-react';

export default function QuantitativeCheckinCell({
  value = 0,
  target = 100,
  unit = '',
  color = { solid: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50' },
  isFuture,
  isLocked,
  disabled,
  onIncrement,
  onDecrement,
  onSetValue,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const idle = isFuture || isLocked || disabled;

  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (pct / 100) * circumference;

  const handleLongPress = () => {
    if (idle) return;
    setInputValue(String(value));
    setShowPopup(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const handleSubmitValue = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num) && num >= 0) onSetValue(num);
    setShowPopup(false);
  };

  const strokeClass = pct >= 100 ? 'stroke-emerald-500' : 'stroke-teal-500';

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="absolute bottom-full mb-2 z-50 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitValue()}
              className="w-20 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
            <button
              onClick={handleSubmitValue}
              className="px-3 py-1.5 rounded-xl bg-teal-500 text-white text-sm font-bold hover:bg-teal-600 transition-colors"
            >
              Set
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        disabled={idle}
        onClick={() => { if (!idle) onIncrement(); }}
        onContextMenu={(e) => { e.preventDefault(); handleLongPress(); }}
        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/30 ${
          idle ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
        }`}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" className="stroke-stone-200 dark:stroke-stone-700" strokeWidth="3" />
          <motion.circle
            cx="22" cy="22" r="18" fill="none"
            className={strokeClass}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <span className={`relative z-10 text-xs font-black ${idle ? 'text-stone-400' : color.text}`}>
          {value}
        </span>
        {!idle && (
          <button
            onClick={(e) => { e.stopPropagation(); onDecrement(); }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-400 text-white flex items-center justify-center hover:bg-rose-500 transition-colors shadow-sm"
          >
            <Minus className="w-2.5 h-2.5" strokeWidth={3} />
          </button>
        )}
        {!idle && value < target && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-stone-400 whitespace-nowrap">
            /{target}{unit}
          </span>
        )}
        {!idle && pct >= 100 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -left-1 text-[10px]"
          >
            ✓
          </motion.span>
        )}
      </button>
    </div>
  );
}
