import { useEffect, useCallback, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { useActivityLogs } from './useActivityLogs';
import { useBabyProfile } from './useBabyProfile';

/**
 * Smart Notifications — rewritten for reliability and UX.
 *
 * Key improvements over the previous version:
 * 1. FIXED: 'last feeding/sleep' now correctly picks the most recent log (previous
 *    code used logs[0] which is not guaranteed to be newest).
 * 2. Data-driven sleep reminders: uses wake-windows based on baby's age, measured
 *    from the last sleep END (not arbitrary hard-coded clock times like 9am/12pm).
 * 3. Global cooldown: at most one notification every 15 minutes, regardless of type.
 * 4. Daily cap: at most 8 notifications per calendar day.
 * 5. Notification history persisted in localStorage, so reloading the page doesn't
 *    reset the anti-spam state.
 * 6. Quiet-hours already respected in useNotifications.showNotification, but we also
 *    suppress checks early when quiet, to save work.
 * 7. Exposes sendTestNotification() so the UI can let users verify notifications work.
 */

interface NotificationHistory {
  // key -> timestamp of last send
  lastSent: { [key: string]: number };
  // yyyy-mm-dd -> count
  dailyCount: { [date: string]: number };
}

const HISTORY_KEY = 'smartNotificationsHistory_v1';
const GLOBAL_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const DAILY_CAP = 8;

const loadHistory = (): NotificationHistory => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return { lastSent: {}, dailyCount: {} };
    const parsed = JSON.parse(raw);
    return {
      lastSent: parsed.lastSent || {},
      dailyCount: parsed.dailyCount || {},
    };
  } catch {
    return { lastSent: {}, dailyCount: {} };
  }
};

const saveHistory = (h: NotificationHistory) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {}
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const isQuietNow = (enabled: boolean, start: string, end: string): boolean => {
  if (!enabled) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  // Overnight window (22:00 -> 07:00)
  if (s > e) return cur >= s || cur <= e;
  return cur >= s && cur <= e;
};

// Wake window (in minutes) = how long a baby can comfortably stay awake before needing sleep.
// Source: pediatric sleep guidelines, averaged.
const getWakeWindowMinutes = (ageWeeks: number): number => {
  if (ageWeeks <= 4) return 45;   // 0-1 month
  if (ageWeeks <= 12) return 75;  // 1-3 months
  if (ageWeeks <= 24) return 105; // 3-6 months
  if (ageWeeks <= 36) return 150; // 6-9 months
  if (ageWeeks <= 52) return 180; // 9-12 months
  if (ageWeeks <= 104) return 240; // 1-2 years
  return 300; // 2+ years
};

export const useSmartNotifications = () => {
  const { showNotification, settings, permission } = useNotifications();
  const { activeProfile } = useBabyProfile();
  const { logs } = useActivityLogs(activeProfile?.id || '');
  const historyRef = useRef<NotificationHistory>(loadHistory());

  const calculateBabyAgeInWeeks = useCallback(() => {
    if (!activeProfile?.birth_date) return 0;
    const birthDate = new Date(activeProfile.birth_date);
    const now = new Date();
    const diffTime = now.getTime() - birthDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)));
  }, [activeProfile]);

  // BUG FIX: sort by start_time desc to reliably get the most recent
  const getLastActivity = useCallback((type: 'feeding' | 'sleep') => {
    const filtered = logs.filter((log) => log.activity_type === type);
    if (filtered.length === 0) return null;
    const sorted = [...filtered].sort((a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
    return sorted[0];
  }, [logs]);

  /**
   * Core gate that decides if a notification may actually fire.
   * Enforces: quiet hours, global cooldown, per-key cooldown, daily cap.
   */
  const canSend = useCallback((key: string, perKeyCooldownMinutes: number): boolean => {
    if (permission !== 'granted') return false;
    if (!settings.notificationsEnabled) return false;
    if (isQuietNow(settings.quietHours.enabled, settings.quietHours.start, settings.quietHours.end)) {
      return false;
    }

    const now = Date.now();
    const h = historyRef.current;

    // Global cooldown — no more than one notification every 15 min
    const lastAny = Math.max(0, ...Object.values(h.lastSent));
    if (now - lastAny < GLOBAL_COOLDOWN_MS) return false;

    // Per-key cooldown
    const lastKey = h.lastSent[key] || 0;
    if (now - lastKey < perKeyCooldownMinutes * 60 * 1000) return false;

    // Daily cap
    const today = todayKey();
    const count = h.dailyCount[today] || 0;
    if (count >= DAILY_CAP) return false;

    return true;
  }, [permission, settings]);

  const recordSent = useCallback((key: string) => {
    const now = Date.now();
    const today = todayKey();
    const h = historyRef.current;
    h.lastSent[key] = now;
    h.dailyCount[today] = (h.dailyCount[today] || 0) + 1;

    // Clean up old daily counts (keep only last 7 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    Object.keys(h.dailyCount).forEach((k) => {
      const [y, m, d] = k.split('-').map(Number);
      if (new Date(y, m - 1, d) < cutoff) delete h.dailyCount[k];
    });
    saveHistory(h);
  }, []);

  const fire = useCallback((key: string, title: string, body: string) => {
    showNotification(title, {
      body,
      tag: key,
      icon: '/favicon.ico',
    });
    recordSent(key);
  }, [showNotification, recordSent]);

  /**
   * Feeding reminder: triggers when (now - lastFeeding) >= configured interval.
   * Per-key cooldown of 30 min to avoid spam if user hasn't logged the feeding yet.
   */
  const checkFeedingReminder = useCallback(() => {
    if (!settings.feedingReminders || !activeProfile) return;
    const last = getLastActivity('feeding');
    if (!last) return;

    const lastStart = new Date(last.start_time);
    const minutesSince = (Date.now() - lastStart.getTime()) / (1000 * 60);
    if (minutesSince < settings.feedingInterval) return;

    if (!canSend('feeding', 30)) return;

    const hours = Math.floor(minutesSince / 60);
    const mins = Math.floor(minutesSince % 60);
    const ago = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    fire(
      'feeding',
      '🍼 Feeding Reminder',
      `It's been ${ago} since ${activeProfile.name}'s last feeding.`
    );
  }, [settings.feedingReminders, settings.feedingInterval, activeProfile, getLastActivity, canSend, fire]);

  /**
   * Sleep reminder: data-driven, not clock-driven. Uses wake-windows based on age.
   * Triggers only if the baby has been awake (time since last sleep END) longer than
   * the recommended wake window. Per-key cooldown of 60 min.
   */
  const checkSleepReminder = useCallback(() => {
    if (!settings.sleepReminders || !activeProfile) return;
    const last = getLastActivity('sleep');
    // Treat sleep END as the moment baby woke up (or use start if no end yet)
    const referenceTime = last
      ? new Date(last.end_time || last.start_time).getTime()
      : null;
    if (!referenceTime) return;

    const ageWeeks = calculateBabyAgeInWeeks();
    const wakeWindow = getWakeWindowMinutes(ageWeeks);
    const minutesAwake = (Date.now() - referenceTime) / (1000 * 60);
    if (minutesAwake < wakeWindow) return;

    if (!canSend('sleep', 60)) return;

    fire(
      'sleep',
      '😴 Sleep Window',
      `${activeProfile.name} has been awake for ${Math.round(minutesAwake)}m. Consider starting a nap.`
    );
  }, [settings.sleepReminders, activeProfile, getLastActivity, calculateBabyAgeInWeeks, canSend, fire]);

  /**
   * Milestone reminder: once per day at most, tied to baby's age in weeks.
   */
  const checkMilestoneReminder = useCallback(() => {
    if (!settings.milestoneReminders || !activeProfile) return;
    const babyAgeWeeks = calculateBabyAgeInWeeks();

    const milestones: { week: number; milestone: string }[] = [
      { week: 2, milestone: 'First smile might appear soon! 😊' },
      { week: 6, milestone: 'Baby might start sleeping longer stretches 💤' },
      { week: 12, milestone: 'Time for 3-month checkup and vaccinations 🏥' },
      { week: 16, milestone: 'Baby might start showing interest in solid foods 🍎' },
      { week: 24, milestone: 'Time for 6-month checkup 👩‍⚕️' },
      { week: 26, milestone: 'Baby might start sitting without support 👶' },
      { week: 36, milestone: 'Baby might start crawling 🚼' },
      { week: 52, milestone: 'Happy first birthday! Time for 1-year checkup 🎂' },
    ];

    const match = milestones.find((m) => m.week === babyAgeWeeks);
    if (!match) return;

    // Once per week max (key is age-specific so each milestone fires only once)
    if (!canSend(`milestone-${babyAgeWeeks}`, 7 * 24 * 60)) return;

    fire('milestone-' + babyAgeWeeks, '🎯 Milestone', match.milestone);
  }, [settings.milestoneReminders, activeProfile, calculateBabyAgeInWeeks, canSend, fire]);

  /**
   * Manually trigger a test notification. Bypasses quiet hours and daily cap so the
   * user can verify the system works at any time — but still respects permission.
   */
  const sendTestNotification = useCallback(() => {
    if (permission !== 'granted') return false;
    showNotification('🔔 Test Notification', {
      body: 'Smart Notifications are working! You\'ll get helpful reminders here.',
      tag: 'test-notification',
      icon: '/favicon.ico',
    });
    return true;
  }, [permission, showNotification]);

  // Periodic check every 5 minutes. Initial check is delayed 30s after mount so we
  // don't spam the user the instant they open the app.
  useEffect(() => {
    if (permission !== 'granted' || !activeProfile || !settings.notificationsEnabled) {
      return;
    }

    const runChecks = () => {
      checkFeedingReminder();
      checkSleepReminder();
      checkMilestoneReminder();
    };

    const initialTimeout = setTimeout(runChecks, 30 * 1000);
    const interval = setInterval(runChecks, 5 * 60 * 1000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [
    permission,
    activeProfile,
    settings.notificationsEnabled,
    checkFeedingReminder,
    checkSleepReminder,
    checkMilestoneReminder,
  ]);

  return {
    checkFeedingReminder,
    checkSleepReminder,
    checkMilestoneReminder,
    sendTestNotification,
  };
};
