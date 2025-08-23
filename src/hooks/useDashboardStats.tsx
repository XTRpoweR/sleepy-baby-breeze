
import { useMemo, useEffect, useState } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useBabyProfile } from '@/hooks/useBabyProfile';

interface DashboardStats {
  weeklyAverageSleep: string;
  weeklyFeedings: number;
  weeklyDiaperChanges: number;
}

export const useDashboardStats = () => {
  const { activeProfile, forceUpdateCounter, switching } = useBabyProfile();
  const { logs, loading, refetchLogs } = useActivityLogs(activeProfile?.id || '');
  const [isRefetching, setIsRefetching] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Immediately clear stats when profile is switching or changes
  useEffect(() => {
    const newProfileId = activeProfile?.id || null;
    
    if (currentProfileId !== newProfileId) {
      console.log('useDashboardStats: Profile changed from', currentProfileId, 'to', newProfileId);
      setCurrentProfileId(newProfileId);
      
      // Force immediate refetch when profile changes
      if (newProfileId) {
        console.log('useDashboardStats: Force refetching data for new profile');
        setIsRefetching(true);
        refetchLogs().finally(() => {
          setIsRefetching(false);
        });
      }
    }
  }, [activeProfile?.id, refetchLogs]);

  // Additional force refetch when forceUpdateCounter changes
  useEffect(() => {
    if (activeProfile?.id && forceUpdateCounter > 0) {
      console.log('useDashboardStats: Force refetching data due to forceUpdateCounter change');
      setIsRefetching(true);
      refetchLogs().finally(() => {
        setIsRefetching(false);
      });
    }
  }, [activeProfile?.id, forceUpdateCounter, refetchLogs]);

  const stats = useMemo(() => {
    console.log('=== useDashboardStats Debug ===');
    console.log('Active profile:', activeProfile?.name);
    console.log('Profile ID:', activeProfile?.id);
    console.log('Switching:', switching);
    console.log('Force update counter:', forceUpdateCounter);
    console.log('Total logs:', logs.length);
    console.log('Current profile ID tracked:', currentProfileId);
    
    // Return empty stats immediately if switching profiles or no profile
    if (switching || !activeProfile || !logs.length) {
      console.log('No data available - switching:', switching, 'activeProfile:', !!activeProfile, 'logs:', logs.length);
      return {
        weeklyAverageSleep: '0h 0m',
        weeklyFeedings: 0,
        weeklyDiaperChanges: 0
      };
    }

    // Get current date in local timezone
    const now = new Date();
    console.log('Current date/time:', now.toISOString());
    console.log('Current local date/time:', now.toString());

    // Calculate start of current week (Monday at 00:00:00)
    const currentDay = now.getDay();
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so if Sunday, 6 days since Monday
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate end of current week (Sunday at 23:59:59)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    console.log('Week boundaries:');
    console.log('Start of week (Monday 00:00):', startOfWeek.toISOString(), '|', startOfWeek.toString());
    console.log('End of week (Sunday 23:59):', endOfWeek.toISOString(), '|', endOfWeek.toString());

    // Debug all logs with their dates
    console.log('All activity logs:');
    logs.forEach((log, index) => {
      const logDate = new Date(log.start_time);
      console.log(`Log ${index + 1}:`, {
        id: log.id,
        type: log.activity_type,
        start_time: log.start_time,
        parsed_date: logDate.toISOString(),
        local_date: logDate.toString(),
        duration_minutes: log.duration_minutes
      });
    });

    // Filter logs for current week
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.start_time);
      const isInWeek = logDate >= startOfWeek && logDate <= endOfWeek;
      
      if (!isInWeek) {
        console.log('Log excluded from week:', {
          start_time: log.start_time,
          logDate: logDate.toISOString(),
          isAfterStart: logDate >= startOfWeek,
          isBeforeEnd: logDate <= endOfWeek,
          reason: logDate < startOfWeek ? 'before week start' : 'after week end'
        });
      }
      
      return isInWeek;
    });

    console.log('Filtered week logs:', weekLogs.length);
    weekLogs.forEach(log => {
      console.log('Week log:', {
        type: log.activity_type,
        start_time: log.start_time,
        duration_minutes: log.duration_minutes
      });
    });

    // Calculate sleep statistics
    const sleepLogs = weekLogs.filter(log => log.activity_type === 'sleep');
    console.log('Sleep logs this week:', sleepLogs.length);
    
    const totalSleepMinutes = sleepLogs.reduce((total, log) => {
      const duration = log.duration_minutes || 0;
      console.log('Adding sleep duration:', duration, 'minutes');
      return total + duration;
    }, 0);
    
    console.log('Total sleep minutes:', totalSleepMinutes);
    
    const averageSleepMinutes = sleepLogs.length > 0 ? totalSleepMinutes / sleepLogs.length : 0;
    console.log('Average sleep minutes per session:', averageSleepMinutes);
    
    const hours = Math.floor(averageSleepMinutes / 60);
    const minutes = Math.round(averageSleepMinutes % 60);

    // Count feedings
    const feedingLogs = weekLogs.filter(log => log.activity_type === 'feeding');
    console.log('Feeding logs this week:', feedingLogs.length);

    // Count diaper changes
    const diaperLogs = weekLogs.filter(log => log.activity_type === 'diaper');
    console.log('Diaper logs this week:', diaperLogs.length);

    const finalStats = {
      weeklyAverageSleep: `${hours}h ${minutes}m`,
      weeklyFeedings: feedingLogs.length,
      weeklyDiaperChanges: diaperLogs.length
    };

    console.log('Final calculated stats:', finalStats);
    console.log('=== End useDashboardStats Debug ===');

    return finalStats;
  }, [logs, forceUpdateCounter, activeProfile, switching]);

  return {
    stats,
    loading: loading || isRefetching || switching,
    hasActiveProfile: !!activeProfile && !switching
  };
};
