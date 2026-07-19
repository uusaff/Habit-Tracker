import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useCheckins(userId) {
  const [checkins, setCheckins] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCheckins({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'users', userId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const map = data.trackerData?.checkins || {};
          setCheckins(map);
        } else {
          setCheckins({});
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [userId]);

  const getEntry = useCallback((dKey, habitId) => {
    const v = checkins[dKey]?.[habitId];
    if (!v) return { status: 'unchecked', note: '', value: 0 };
    if (v === true) return { status: 'checked', note: '', value: 1 };
    return { status: v.status || 'unchecked', note: v.note || '', value: v.value != null ? v.value : (v.status === 'checked' ? 1 : 0) };
  }, [checkins]);

  const toggleCheckin = useCallback(async (habitId, dKey, options = {}) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const current = checkins[dKey]?.[habitId];
    const currentStatus = !current ? 'unchecked' : current === true ? 'checked' : current.status || 'unchecked';
    const nextStatus = options.status || (currentStatus === 'checked' ? 'skipped' : currentStatus === 'skipped' ? 'unchecked' : 'checked');

    const entry = { status: nextStatus, note: (current && current.note) || '', updatedAt: new Date().toISOString() };
    if (options.value != null) entry.value = options.value;
    if (options.note != null) entry.note = options.note;

    const updated = { ...checkins, [dKey]: { ...(checkins[dKey] || {}), [habitId]: entry } };
    await setDoc(ref, { trackerData: { checkins: updated } }, { merge: true });
  }, [userId, checkins]);

  const setCheckinNote = useCallback(async (habitId, dKey, note) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const existing = checkins[dKey]?.[habitId] || {};
    const entry = { ...(existing === true ? { status: 'checked' } : existing), note, updatedAt: new Date().toISOString() };
    const updated = { ...checkins, [dKey]: { ...(checkins[dKey] || {}), [habitId]: entry } };
    await setDoc(ref, { trackerData: { checkins: updated } }, { merge: true });
  }, [userId, checkins]);

  const toggleRelapse = useCallback(async (habitId, dKey) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const existing = checkins[dKey] || {};
    const updated = { ...checkins, [dKey]: { ...existing, [habitId]: { status: 'relapse', updatedAt: new Date().toISOString() } } };
    await setDoc(ref, { trackerData: { checkins: updated } }, { merge: true });
  }, [userId, checkins]);

  const getDaysSinceLast = useCallback((habitId, statusFilter = 'checked') => {
    const days = Object.keys(checkins).filter((dk) => {
      const entry = checkins[dk]?.[habitId];
      if (!entry) return false;
      const s = entry === true ? 'checked' : entry.status;
      return s === statusFilter;
    }).sort().reverse();
    if (days.length === 0) return null;
    const last = new Date(days[0] + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor((now - last) / (1000 * 60 * 60 * 24));
  }, [checkins]);

  const getStreak = useCallback((habitId) => {
    const sorted = Object.keys(checkins)
      .filter((dk) => {
        const entry = checkins[dk]?.[habitId];
        if (!entry) return false;
        const s = entry === true ? 'checked' : entry.status;
        return s === 'checked';
      })
      .sort()
      .reverse();
    if (sorted.length === 0) return { current: 0, longest: 0 };
    let current = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i] + 'T00:00:00');
      const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
      if (diff === i) current++;
      else break;
    }
    let longest = 1;
    let run = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + 'T00:00:00');
      const curr = new Date(sorted[i] + 'T00:00:00');
      const diff = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
      if (diff === 1) { run++; longest = Math.max(longest, run); }
      else run = 1;
    }
    longest = Math.max(longest, run);
    return { current, longest };
  }, [checkins]);

  return { checkins, loading, getEntry, toggleCheckin, setCheckinNote, toggleRelapse, getDaysSinceLast, getStreak };
}
