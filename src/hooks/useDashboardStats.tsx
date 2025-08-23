
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
  const { logs, loading, refetchLogs } = useActivityLogs(activeProfile?.id || '', forceUpdateCounter);
  const [isRefetching, setIsRefetching] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Track profile changes but don't use immediateSwitch flag
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
    if (activeProfile?.id && forceUpdateCounter && forceUpdateCounter > 0) {
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
    
    // Return empty stats only if switching profiles or no profile
    if (switching || !activeProfile) {
      console.log('No data available - switching:', switching, 'activeProfile:', !!activeProfile);
      return {
        weeklyAverageSleep: '0h 0m',
        weeklyFeedings: 0,
        weeklyDiaperChanges: 0
      };
    }

    // If no logs, return zero stats but don't treat as loading
    if (!logs.length) {
      console.log('No logs available for profile:', activeProfile.name);
      return {
        weeklyAverageSleep: '0h 0m',
        weeklyFeedings: 0,
        weeklyDiaperChanges: 0
      };
    }

    // Get current date in local timezone
    const now = new Date();
    console.log('Current date/time:', now.toISOString());

    // Calculate start of current week (Monday at 00:00:00)
    const currentDay = now.getDay();
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate end of current week (Sunday at 23:59:59)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    console.log('Week boundaries:');
    console.log('Start of week (Monday 00:00):', startOfWeek.toISOString());
    console.log('End of week (Sunday 23:59):', endOfWeek.toISOString());

    // Filter logs for current week
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.start_time);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    });

    console.log('Filtered week logs:', weekLogs.length);

    // Calculate sleep statistics
    const sleepLogs = weekLogs.filter(log => log.activity_type === 'sleep');
    const totalSleepMinutes = sleepLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0);
    const averageSleepMinutes = sleepLogs.length > 0 ? totalSleepMinutes / sleepLogs.length : 0;
    
    const hours = Math.floor(averageSleepMinutes / 60);
    const minutes = Math.round(averageSleepMinutes % 60);

    // Count feedings and diaper changes
    const feedingLogs = weekLogs.filter(log => log.activity_type === 'feeding');
    const diaperLogs = weekLogs.filter(log => log.activity_type === 'diaper');

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
