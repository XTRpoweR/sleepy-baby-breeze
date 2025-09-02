
import { useMemo, useEffect } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { profileEventManager } from '@/utils/profileEvents';

interface DashboardStats {
  weeklyAverageSleep: string;
  weeklyFeedings: number;
  weeklyDiaperChanges: number;
}

export const useDashboardStats = () => {
  const { activeProfile } = useBabyProfile();
  const { logs, loading } = useActivityLogs(activeProfile?.id || '');

  // Listen for profile changes to force stats reset
  useEffect(() => {
    const unsubscribe = profileEventManager.subscribe((newProfileId) => {
      // The stats will automatically recalculate when logs change due to useMemo dependencies
    });

    return unsubscribe;
  }, []);

  const stats = useMemo(() => {
    // If we're loading or have no active profile, return zero stats
    if (loading || !activeProfile) {
      return {
        weeklyAverageSleep: '0h 0m',
        weeklyFeedings: 0,
        weeklyDiaperChanges: 0
      };
    }

    if (!logs.length) {
      return {
        weeklyAverageSleep: '0h 0m',
        weeklyFeedings: 0,
        weeklyDiaperChanges: 0
      };
    }

    // Get current date and calculate week boundaries
    const now = new Date();
    const currentDay = now.getDay();
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filter logs for current week
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.start_time);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    });

    // Calculate sleep statistics
    const sleepLogs = weekLogs.filter(log => log.activity_type === 'sleep');
    const totalSleepMinutes = sleepLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0);
    const averageSleepMinutes = sleepLogs.length > 0 ? totalSleepMinutes / sleepLogs.length : 0;
    
    const hours = Math.floor(averageSleepMinutes / 60);
    const minutes = Math.round(averageSleepMinutes % 60);

    // Count activities
    const feedingLogs = weekLogs.filter(log => log.activity_type === 'feeding');
    const diaperLogs = weekLogs.filter(log => log.activity_type === 'diaper');

    return {
      weeklyAverageSleep: `${hours}h ${minutes}m`,
      weeklyFeedings: feedingLogs.length,
      weeklyDiaperChanges: diaperLogs.length
    };
  }, [logs, loading, activeProfile?.id]);

  // Return loading state that matches the activity logs loading state
  return {
    stats,
    loading,
    hasActiveProfile: !!activeProfile
  };
};
