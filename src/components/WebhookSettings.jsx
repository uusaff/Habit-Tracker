import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Trash2, Plus, Check, X, Loader, AlertCircle } from 'lucide-react';

export default function WebhookSettings({ webhooks, addWebhook, removeWebhook, testWebhook, events, lastResult, setLastResult }) {
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [selectedEvents, setSelectedEvents] = useState(['checkin']);
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async (testUrl) => {
    setTesting(testUrl);
    setTestResult(null);
    const result = await testWebhook(testUrl);
    setTestResult(result);
    setTesting(null);
  };

  const handleAdd = () => {
    if (!url.trim()) return;
    addWebhook(url.trim(), selectedEvents, label.trim() || undefined);
    setUrl(''); setLabel(''); setSelectedEvents(['checkin']); setShowForm(false);
  };

  const toggleEvent = (eid) => {
    setSelectedEvents((prev) => prev.includes(eid) ? prev.filter((e) => e !== eid) : [...prev, eid]);
  };

  return (
    <div className="space-y-3">
      {webhooks.length > 0 && (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div key={wh.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-800 dark:text-white truncate">{wh.label}</p>
                <p className="text-[10px] font-mono text-stone-400 truncate">{wh.url}</p>
                <div className="flex gap-1 mt-1">
                  {wh.events.map((e) => (
                    <span key={e} className="text-[8px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-500 font-medium">{e}</span>
                  ))}
                </div>
                {wh.lastFired && (
                  <p className={`text-[8px] mt-0.5 font-medium ${wh.lastStatus === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {wh.lastStatus === 'success' ? '✓ Last fired' : '✗ Last error'} {new Date(wh.lastFired).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button onClick={() => handleTest(wh.url)} disabled={testing === wh.url} className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                  {testing === wh.url ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => removeWebhook(wh.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-400 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {testResult && (
        <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${testResult.ok ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}`}>
          {testResult.ok ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {testResult.ok ? `Connected (${testResult.status})` : `Failed: ${testResult.error || 'check URL'}`}
          <button onClick={() => setTestResult(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {lastResult && !testResult && (
        <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${lastResult.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}`}>
          {lastResult.status === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {lastResult.status === 'success' ? 'Webhook dispatched' : `Error: ${lastResult.error || 'unknown'}`}
          <button onClick={() => setLastResult(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      <AnimatePresence>
        {showForm ? (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-2">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhook" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono outline-none focus:ring-2 focus:ring-teal-500" />
            <div>
              <p className="text-[10px] font-semibold text-stone-500 mb-1">Events</p>
              <div className="flex flex-wrap gap-1.5">
                {events.map((ev) => (
                  <button key={ev.id} onClick={() => toggleEvent(ev.id)} className={`px-2 py-1 rounded-full text-[10px] font-semibold border transition-all ${selectedEvents.includes(ev.id) ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500'}`}>
                    {ev.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAdd} disabled={!url.trim()} className="flex-1 py-2 rounded-xl bg-teal-500 text-white text-xs font-bold hover:bg-teal-600 transition-colors disabled:opacity-50">
                <Plus className="w-3 h-3 inline mr-1" /> Add Webhook
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">Cancel</button>
            </div>
          </motion.div>
        ) : (
          <button onClick={() => setShowForm(true)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-400 text-xs font-bold hover:border-teal-400 hover:text-teal-500 transition-all flex items-center justify-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Webhook
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
