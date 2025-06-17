
import { useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useActivityLogs } from './useActivityLogs';
import { useBabyProfile } from './useBabyProfile';

export const useSmartNotifications = () => {
  const { showNotification, settings } = useNotifications();
  const { activeProfile } = useBabyProfile();
  const { logs } = useActivityLogs(activeProfile?.id || '');

  const calculateBabyAgeInWeeks = useCallback(() => {
    if (!activeProfile?.birth_date) return 0;
    const birthDate = new Date(activeProfile.birth_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birthDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  }, [activeProfile]);

  const getLastFeedingTime = useCallback(() => {
    const feedingLogs = logs.filter(log => log.activity_type === 'feeding');
    if (feedingLogs.length === 0) return null;
    return new Date(feedingLogs[0].start_time);
  }, [logs]);

  const getLastSleepTime = useCallback(() => {
    const sleepLogs = logs.filter(log => log.activity_type === 'sleep');
    if (sleepLogs.length === 0) return null;
    return new Date(sleepLogs[0].start_time);
  }, [logs]);

  const checkFeedingReminder = useCallback(() => {
    if (!settings.feedingReminders || !activeProfile) return;

    const lastFeeding = getLastFeedingTime();
    if (!lastFeeding) return;

    const now = new Date();
    const minutesSinceFeeding = (now.getTime() - lastFeeding.getTime()) / (1000 * 60);

    if (minutesSinceFeeding >= settings.feedingInterval) {
      showNotification('Feeding Reminder', {
        body: `It's been ${Math.floor(minutesSinceFeeding / 60)} hours since ${activeProfile.name}'s last feeding`,
        icon: '/favicon.ico'
      });
    }
  }, [settings.feedingReminders, settings.feedingInterval, activeProfile, getLastFeedingTime, showNotification]);

  const checkSleepReminder = useCallback(() => {
    if (!settings.sleepReminders || !activeProfile) return;

    const babyAgeWeeks = calculateBabyAgeInWeeks();
    const now = new Date();
    const currentHour = now.getHours();

    // Age-appropriate sleep windows
    let suggestedNapTime = null;
    if (babyAgeWeeks <= 12) {
      // Newborn (0-3 months): More frequent naps
      if ([9, 12, 15, 18].includes(currentHour)) {
        suggestedNapTime = 'nap time';
      }
    } else if (babyAgeWeeks <= 24) {
      // 3-6 months: Morning and afternoon naps
      if ([10, 14].includes(currentHour)) {
        suggestedNapTime = 'nap time';
      }
    } else {
      // 6+ months: Usually one afternoon nap
      if (currentHour === 13) {
        suggestedNapTime = 'nap time';
      }
    }

    // Evening bedtime reminder
    if (currentHour === 19) {
      suggestedNapTime = 'bedtime';
    }

    if (suggestedNapTime) {
      showNotification('Sleep Reminder', {
        body: `It might be ${suggestedNapTime} for ${activeProfile.name}`,
        icon: '/favicon.ico'
      });
    }
  }, [settings.sleepReminders, activeProfile, calculateBabyAgeInWeeks, showNotification]);

  const checkMilestoneReminder = useCallback(() => {
    if (!settings.milestoneReminders || !activeProfile) return;

    const babyAgeWeeks = calculateBabyAgeInWeeks();
    const milestones = [
      { week: 2, milestone: 'First smile might appear soon!' },
      { week: 6, milestone: 'Baby might start sleeping longer stretches' },
      { week: 12, milestone: 'Time for 3-month checkup and vaccinations' },
      { week: 16, milestone: 'Baby might start showing interest in solid foods' },
      { week: 24, milestone: 'Time for 6-month checkup' },
      { week: 26, milestone: 'Baby might start sitting without support' },
      { week: 36, milestone: 'Baby might start crawling' },
      { week: 52, milestone: 'Happy first birthday! Time for 1-year checkup' }
    ];

    const upcomingMilestone = milestones.find(m => m.week === babyAgeWeeks);
    if (upcomingMilestone) {
      showNotification('Milestone Reminder', {
        body: upcomingMilestone.milestone,
        icon: '/favicon.ico'
      });
    }
  }, [settings.milestoneReminders, activeProfile, calculateBabyAgeInWeeks, showNotification]);

  // Set up periodic checks
  useEffect(() => {
    const interval = setInterval(() => {
      checkFeedingReminder();
      checkSleepReminder();
      checkMilestoneReminder();
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(interval);
  }, [checkFeedingReminder, checkSleepReminder, checkMilestoneReminder]);

  return {
    checkFeedingReminder,
    checkSleepReminder,
    checkMilestoneReminder
  };
};
