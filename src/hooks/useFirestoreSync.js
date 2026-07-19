import { useHabits } from './useHabits';
import { useCheckins } from './useCheckins';
import { useProfile } from './useProfile';

export function useFirestoreSync(userId) {
  const {
    habits,
    loading: habitsLoading,
    error: habitsError,
    addHabit,
    updateHabit,
    deleteHabit,
  } = useHabits(userId);

  const {
    checkins,
    loading: checkinsLoading,
    getEntry,
    toggleCheckin,
    setCheckinNote,
    toggleRelapse,
    getDaysSinceLast,
    getStreak,
  } = useCheckins(userId);

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    saveProfile,
  } = useProfile(userId);

  const loading = habitsLoading || checkinsLoading || profileLoading;
  const error = habitsError || profileError;
  const ready = !loading && habits !== null && profile !== null;

  return {
    habits: habits || [],
    checkins,
    profile,
    loading,
    error,
    ready,
    getEntry,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCheckin,
    setCheckinNote,
    toggleRelapse,
    getDaysSinceLast,
    getStreak,
    saveProfile,
  };
}
