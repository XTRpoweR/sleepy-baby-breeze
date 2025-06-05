
import { useMemo } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useBabyProfile } from '@/hooks/useBabyProfile';

interface DashboardStats {
  weeklyAverageSleep: string;
  weeklyFeedings: number;
  weeklyDiaperChanges: number;
}

export const useDashboardStats = () => {
  const { activeProfile } = useBabyProfile();
  const { logs, loading } = useActivityLogs(activeProfile?.id || '');

  const stats = useMemo(() => {
    if (!logs.length) {
      return {
        weeklyAverageSleep: '0h 0m',
        weeklyFeedings: 0,
        weeklyDiaperChanges: 0
      };
    }

    // Get current week (Monday to Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
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

    // Count feedings
    const feedingLogs = weekLogs.filter(log => log.activity_type === 'feeding');

    // Count diaper changes
    const diaperLogs = weekLogs.filter(log => log.activity_type === 'diaper');

    return {
      weeklyAverageSleep: `${hours}h ${minutes}m`,
      weeklyFeedings: feedingLogs.length,
      weeklyDiaperChanges: diaperLogs.length
    };
  }, [logs]);

  return {
    stats,
    loading,
    hasActiveProfile: !!activeProfile
  };
};
