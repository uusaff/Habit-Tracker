import { useMemo } from 'react';

function dateKey(d) {
  const p = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function usePatternDetection(habits, checkins, today) {

  const byDayOfWeek = useMemo(() => {
    const map = {};
    habits.forEach((h) => { map[h.id] = { total: 0, days: [0, 0, 0, 0, 0, 0, 0], count: [0, 0, 0, 0, 0, 0, 0] }; });
    Object.keys(checkins).forEach((dk) => {
      const d = new Date(dk + 'T00:00:00');
      if (d > today) return;
      const dow = d.getDay();
      const entries = checkins[dk] || {};
      habits.forEach((h) => {
        const e = entries[h.id];
        if (e && (e === true || e.status === 'checked')) {
          map[h.id].total++;
          map[h.id].count[dow]++;
        }
        map[h.id].days[dow]++;
      });
    });
    return map;
  }, [habits, checkins, today]);

  const skipPatterns = useMemo(() => {
    const patterns = [];
    habits.forEach((h) => {
      const stats = byDayOfWeek[h.id];
      if (!stats || stats.total < 3) return;
      const avg = stats.total / Math.max(stats.days.reduce((a, b) => a + b, 0), 1);
      stats.count.forEach((c, i) => {
        const dayTotal = stats.days[i];
        if (dayTotal < 2) return;
        const rate = c / dayTotal;
        if (rate < avg * 0.5 && rate < 0.3) {
          patterns.push({ habitId: h.id, habitName: h.name, day: i, rate: Math.round(rate * 100), severity: 'skip' });
        }
      });
    });
    return patterns.sort((a, b) => a.rate - b.rate).slice(0, 3);
  }, [habits, byDayOfWeek]);

  const consistencyTrend = useMemo(() => {
    const weeks = 4;
    const trends = [];
    habits.forEach((h) => {
      const weekData = Array.from({ length: weeks }, (_, wi) => {
        const end = new Date(today);
        end.setDate(end.getDate() - wi * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        let checked = 0;
        let totalDays = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d > today) continue;
          const dk = dateKey(d);
          const e = checkins[dk]?.[h.id];
          if (e && (e === true || e.status === 'checked')) checked++;
          totalDays++;
        }
        return totalDays > 0 ? checked / totalDays : 0;
      }).reverse();
      const trend = weekData.length > 1 ? weekData[weekData.length - 1] - weekData[0] : 0;
      trends.push({
        habitId: h.id,
        habitName: h.name,
        weeks: weekData.map((w) => Math.round(w * 100)),
        direction: trend > 0.05 ? 'up' : trend < -0.05 ? 'down' : 'flat',
        change: Math.round(Math.abs(trend) * 100),
      });
    });
    return trends;
  }, [habits, checkins, today]);

  const bestWorst = useMemo(() => {
    if (habits.length === 0) return { best: null, worst: null };
    let best = null, worst = null, bestRate = -1, worstRate = 2;
    habits.forEach((h) => {
      const stats = byDayOfWeek[h.id];
      if (!stats || stats.total === 0) return;
      const totalDays = stats.days.reduce((a, b) => a + b, 0);
      const rate = stats.total / Math.max(totalDays, 1);
      if (rate > bestRate) { bestRate = rate; best = { ...h, rate: Math.round(rate * 100) }; }
      if (rate < worstRate) { worstRate = rate; worst = { ...h, rate: Math.round(rate * 100) }; }
    });
    return { best, worst };
  }, [habits, byDayOfWeek]);

  const streakProjection = useMemo(() => {
    const results = [];
    habits.forEach((h) => {
      const stats = byDayOfWeek[h.id];
      if (!stats) return;
      const totalDays = stats.days.reduce((a, b) => a + b, 0);
      const avgRate = totalDays > 0 ? stats.total / totalDays : 0;
      if (avgRate === 0) return;
      const daysPerCheckin = 1 / avgRate;
      const milestones = [7, 14, 21, 30, 60, 90, 365];
      let streak = 0;
      const cursor = new Date(today);
      for (let i = 0; i < 90; i++) {
        const dk = dateKey(cursor);
        const e = checkins[dk]?.[h.id];
        if (e && (e === true || e.status === 'checked')) streak++;
        else if (e && e.status === 'skipped') { streak++; }
        else break;
        cursor.setDate(cursor.getDate() - 1);
      }
      results.push({
        habitId: h.id,
        habitName: h.name,
        currentStreak: streak,
        avgRate: Math.round(avgRate * 100),
        nextMilestones: milestones
          .filter((m) => m > streak)
          .slice(0, 3)
          .map((m) => ({
            milestone: m,
            eta: Math.round((m - streak) * daysPerCheckin),
          })),
      });
    });
    return results;
  }, [habits, checkins, byDayOfWeek, today]);

  const weeklySummary = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    let checked = 0, total = 0, skipped = 0;
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const dk = dateKey(d);
      habits.forEach((h) => {
        const e = checkins[dk]?.[h.id];
        if (e && (e === true || e.status === 'checked')) checked++;
        else if (e && e.status === 'skipped') skipped++;
        total++;
      });
    }
    const rate = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { checked, skipped, total, rate };
  }, [habits, checkins, today]);

  return { skipPatterns, consistencyTrend, bestWorst, streakProjection, weeklySummary };
}
