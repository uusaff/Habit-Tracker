import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'habit_webhooks';

const DEFAULT_EVENTS = [
  { id: 'checkin', label: 'On Check-in', description: 'Fires when any habit is checked' },
  { id: 'streak_milestone', label: 'Streak Milestone', description: 'Fires when a streak reaches 7, 14, 30, or 90 days' },
  { id: 'daily_summary', label: 'Daily Summary', description: 'Fires once per day with a summary' },
  { id: 'challenge_complete', label: 'Challenge Complete', description: 'Fires when a weekly challenge is completed' },
];

function loadConfigs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState(loadConfigs);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
  }, [webhooks]);

  const addWebhook = useCallback((url, events, label) => {
    const id = 'wh_' + Date.now();
    setWebhooks((prev) => [...prev, { id, url, events, label: label || 'Unnamed Webhook', createdAt: new Date().toISOString(), lastStatus: null }]);
    return id;
  }, []);

  const removeWebhook = useCallback((id) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWebhook = useCallback((id, updates) => {
    setWebhooks((prev) => prev.map((w) => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const dispatchWebhook = useCallback(async (eventId, payload) => {
    const targets = webhooks.filter((w) => w.events.includes(eventId));
    if (targets.length === 0) return [];

    const results = [];
    for (const target of targets) {
      try {
        const res = await fetch(target.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: eventId, timestamp: new Date().toISOString(), ...payload }),
        });
        const ok = res.ok;
        const text = await res.text();
        results.push({ id: target.id, url: target.url, status: ok ? 'success' : 'error', statusCode: res.status, body: text });
        setLastResult({ url: target.url, status: ok ? 'success' : 'error', at: new Date().toISOString() });
        updateWebhook(target.id, { lastStatus: ok ? 'success' : 'error', lastFired: new Date().toISOString() });
      } catch (err) {
        results.push({ id: target.id, url: target.url, status: 'error', error: err.message });
        setLastResult({ url: target.url, status: 'error', error: err.message, at: new Date().toISOString() });
        updateWebhook(target.id, { lastStatus: 'error', lastFired: new Date().toISOString() });
      }
    }
    return results;
  }, [webhooks, updateWebhook]);

  const testWebhook = useCallback(async (url) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString(), message: 'Hello from Habit Tracker!' }),
      });
      return { ok: res.ok, status: res.status };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  return { webhooks, addWebhook, removeWebhook, updateWebhook, dispatchWebhook, testWebhook, lastResult, events: DEFAULT_EVENTS, setLastResult };
}

export function exportToJSON(habits, checkins, profile) {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    profile,
    habits: habits.map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      category: h.category,
      type: h.type || 'binary',
      target: h.target || null,
      unit: h.unit || null,
    })),
    checkins: Object.fromEntries(
      Object.entries(checkins).map(([date, entries]) => [
        date,
        Object.fromEntries(
          Object.entries(entries).map(([habitId, entry]) => [
            habitId,
            entry === true ? { status: 'checked' } : { status: entry.status, note: entry.note || null, value: entry.value ?? null },
          ])
        ),
      ])
    ),
    stats: {
      totalHabits: habits.length,
      totalCheckins: Object.values(checkins).reduce((acc, day) => acc + Object.values(day).filter((e) => e && (e === true || e.status === 'checked')).length, 0),
      trackedDays: Object.keys(checkins).length,
    },
  }, null, 2);
}

export function exportToICS(habits, checkins) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Habit Tracker//EN',
    'CALSCALE:GREGORIAN',
  ];
  Object.entries(checkins).forEach(([dateKey, entries]) => {
    Object.entries(entries).forEach(([habitId, entry]) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;
      const checked = entry === true || entry?.status === 'checked';
      if (!checked) return;
      const [y, m, d] = dateKey.split('-').map(Number);
      const dt = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
      const summary = `${checked ? '✓' : '○'} ${habit.name}`;
      lines.push('BEGIN:VEVENT');
      lines.push(`DTSTART;VALUE=DATE:${dt}`);
      lines.push(`DTEND;VALUE=DATE:${dt}`);
      lines.push(`SUMMARY:${summary}`);
      lines.push('END:VEVENT');
    });
  });
  lines.push('END:VCALENDAR');
  return lines.join('\n');
}
