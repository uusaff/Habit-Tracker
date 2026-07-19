import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useHabits(userId) {
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setHabits(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'users', userId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const list = Array.isArray(data.trackerData?.habits) ? data.trackerData.habits : [];
          setHabits(list);
        } else {
          setHabits([]);
        }
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return unsub;
  }, [userId]);

  const addHabit = useCallback(async (habit) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const newHabit = { id: 'h' + Date.now(), ...habit, sortOrder: (habits || []).length, createdAt: new Date().toISOString(), archived: false };
    await setDoc(ref, { trackerData: { habits: [...(habits || []), newHabit] } }, { merge: true });
  }, [userId, habits]);

  const updateHabit = useCallback(async (habitId, data) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const updated = (habits || []).map((h) => h.id === habitId ? { ...h, ...data } : h);
    await setDoc(ref, { trackerData: { habits: updated } }, { merge: true });
  }, [userId, habits]);

  const deleteHabit = useCallback(async (habitId) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const filtered = (habits || []).filter((h) => h.id !== habitId);
    await setDoc(ref, { trackerData: { habits: filtered } }, { merge: true });
  }, [userId, habits]);

  const reorderHabits = useCallback(async (orderedIds) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const reordered = orderedIds.map((id, idx) => {
      const h = (habits || []).find((h) => h.id === id);
      return h ? { ...h, sortOrder: idx } : null;
    }).filter(Boolean);
    await setDoc(ref, { trackerData: { habits: reordered } }, { merge: true });
  }, [userId, habits]);

  return { habits, loading, error, addHabit, updateHabit, deleteHabit, reorderHabits };
}
