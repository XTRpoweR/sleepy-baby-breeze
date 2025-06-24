
import { useEffect, useCallback, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { useActivityLogs } from './useActivityLogs';
import { useBabyProfile } from './useBabyProfile';

export const useSmartNotifications = () => {
  const { showNotification, settings, permission } = useNotifications();
  const { activeProfile } = useBabyProfile();
  const { logs } = useActivityLogs(activeProfile?.id || '');
  const lastNotificationTimeRef = useRef<{ [key: string]: number }>({});

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

  const shouldSendNotification = useCallback((type: string, intervalMinutes: number = 60) => {
    const now = Date.now();
    const lastTime = lastNotificationTimeRef.current[type] || 0;
    const timeDiff = now - lastTime;
    
    if (timeDiff >= intervalMinutes * 60 * 1000) {
      lastNotificationTimeRef.current[type] = now;
      return true;
    }
    return false;
  }, []);

  const checkFeedingReminder = useCallback(() => {
    if (!settings.feedingReminders || !activeProfile || permission !== 'granted') return;

    const lastFeeding = getLastFeedingTime();
    if (!lastFeeding) return;

    const now = new Date();
    const minutesSinceFeeding = (now.getTime() - lastFeeding.getTime()) / (1000 * 60);

    // Check if it's time for a feeding reminder
    if (minutesSinceFeeding >= settings.feedingInterval) {
      if (shouldSendNotification('feeding', 30)) { // Don't spam - max once per 30 minutes
        const hours = Math.floor(minutesSinceFeeding / 60);
        const minutes = Math.floor(minutesSinceFeeding % 60);
        
        showNotification('🍼 Feeding Time!', {
          body: `It's been ${hours > 0 ? `${hours}h ` : ''}${minutes}m since ${activeProfile.name}'s last feeding`,
          tag: 'feeding-reminder',
          icon: '/favicon.ico'
        });
      }
    }
  }, [settings.feedingReminders, settings.feedingInterval, activeProfile, getLastFeedingTime, showNotification, permission, shouldSendNotification]);

  const checkSleepReminder = useCallback(() => {
    if (!settings.sleepReminders || !activeProfile || permission !== 'granted') return;

    const babyAgeWeeks = calculateBabyAgeInWeeks();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Age-appropriate sleep windows with specific times
    let shouldRemind = false;
    let reminderType = '';

    if (babyAgeWeeks <= 12) {
      // Newborn (0-3 months): More frequent naps
      if ([9, 12, 15, 18].includes(currentHour) && currentMinute < 15) {
        shouldRemind = true;
        reminderType = 'nap time';
      }
    } else if (babyAgeWeeks <= 24) {
      // 3-6 months: Morning and afternoon naps
      if ([10, 14].includes(currentHour) && currentMinute < 15) {
        shouldRemind = true;
        reminderType = 'nap time';
      }
    } else {
      // 6+ months: Usually one afternoon nap
      if (currentHour === 13 && currentMinute < 15) {
        shouldRemind = true;
        reminderType = 'nap time';
      }
    }

    // Evening bedtime reminder for all ages
    if (currentHour === 19 && currentMinute < 15) {
      shouldRemind = true;
      reminderType = 'bedtime';
    }

    if (shouldRemind && shouldSendNotification(`sleep-${reminderType}`, 60)) {
      const icon = reminderType === 'bedtime' ? '🌙' : '😴';
      showNotification(`${icon} Sleep Time!`, {
        body: `It might be ${reminderType} for ${activeProfile.name}`,
        tag: 'sleep-reminder',
        icon: '/favicon.ico'
      });
    }
  }, [settings.sleepReminders, activeProfile, calculateBabyAgeInWeeks, showNotification, permission, shouldSendNotification]);

  const checkMilestoneReminder = useCallback(() => {
    if (!settings.milestoneReminders || !activeProfile || permission !== 'granted') return;

    const babyAgeWeeks = calculateBabyAgeInWeeks();
    const milestones = [
      { week: 2, milestone: 'First smile might appear soon! 😊' },
      { week: 6, milestone: 'Baby might start sleeping longer stretches 💤' },
      { week: 12, milestone: 'Time for 3-month checkup and vaccinations 🏥' },
      { week: 16, milestone: 'Baby might start showing interest in solid foods 🍎' },
      { week: 24, milestone: 'Time for 6-month checkup 👩‍⚕️' },
      { week: 26, milestone: 'Baby might start sitting without support 👶' },
      { week: 36, milestone: 'Baby might start crawling 🚼' },
      { week: 52, milestone: 'Happy first birthday! Time for 1-year checkup 🎂' }
    ];

    const upcomingMilestone = milestones.find(m => m.week === babyAgeWeeks);
    if (upcomingMilestone && shouldSendNotification(`milestone-${babyAgeWeeks}`, 24 * 60)) { // Once per day max
      showNotification('🎯 Milestone Alert!', {
        body: upcomingMilestone.milestone,
        tag: 'milestone-reminder',
        icon: '/favicon.ico'
      });
    }
  }, [settings.milestoneReminders, activeProfile, calculateBabyAgeInWeeks, showNotification, permission, shouldSendNotification]);

  // Set up periodic checks - check every 5 minutes for more responsive notifications
  useEffect(() => {
    if (permission !== 'granted' || !activeProfile) {
      console.log('Smart notifications disabled - no permission or active profile');
      return;
    }

    console.log('Starting smart notification monitoring for:', activeProfile.name);

    // Initial check
    checkFeedingReminder();
    checkSleepReminder();
    checkMilestoneReminder();

    // Set up interval for regular checks
    const interval = setInterval(() => {
      checkFeedingReminder();
      checkSleepReminder();
      checkMilestoneReminder();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      console.log('Stopping smart notification monitoring');
      clearInterval(interval);
    };
  }, [checkFeedingReminder, checkSleepReminder, checkMilestoneReminder, permission, activeProfile]);

  return {
    checkFeedingReminder,
    checkSleepReminder,
    checkMilestoneReminder
  };
};
