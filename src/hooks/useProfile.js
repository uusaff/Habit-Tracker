import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_PROFILE = { name: '', age: '', weight: '' };

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'users', userId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data.profileData || DEFAULT_PROFILE);
        } else {
          setProfile(DEFAULT_PROFILE);
        }
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return unsub;
  }, [userId]);

  const saveProfile = useCallback(async (data) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    await setDoc(ref, { profileData: data }, { merge: true });
  }, [userId]);

  return { profile, loading, error, saveProfile };
}
