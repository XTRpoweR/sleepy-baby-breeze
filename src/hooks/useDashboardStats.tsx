
import { useMemo, useEffect, useState } from 'react';
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
  const [profileSwitching, setProfileSwitching] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(activeProfile?.id || null);

  // Listen for profile switching and changes with timeout protection
  useEffect(() => {
    let switchingTimeout: NodeJS.Timeout | null = null;

    const unsubscribeSwitching = profileEventManager.subscribeToSwitching(() => {
      console.log('useDashboardStats: Profile switching started - showing loading state');
      setProfileSwitching(true);
      
      // Clear any existing timeout
      if (switchingTimeout) {
        clearTimeout(switchingTimeout);
      }
      
      // Failsafe: reset switching state after 3 seconds if no profile change event
      switchingTimeout = setTimeout(() => {
        console.log('useDashboardStats: Switching timeout - forcing reset');
        setProfileSwitching(false);
      }, 3000);
    });

    const unsubscribe = profileEventManager.subscribe((newProfileId) => {
      console.log('useDashboardStats: Profile changed to:', newProfileId);
      
      // Clear the timeout since we got the change event
      if (switchingTimeout) {
        clearTimeout(switchingTimeout);
        switchingTimeout = null;
      }
      
      setCurrentProfileId(newProfileId);
      setProfileSwitching(false);
    });

    return () => {
      if (switchingTimeout) {
        clearTimeout(switchingTimeout);
      }
      unsubscribeSwitching();
      unsubscribe();
    };
  }, []);

  // Update current profile ID when activeProfile changes
  useEffect(() => {
    const newProfileId = activeProfile?.id || null;
    if (newProfileId !== currentProfileId) {
      setCurrentProfileId(newProfileId);
    }
  }, [activeProfile?.id, currentProfileId]);

  const stats = useMemo(() => {
    console.log('=== useDashboardStats Debug ===');
    console.log('Active Profile ID:', activeProfile?.id);
    console.log('Current Profile ID:', currentProfileId);
    console.log('Total logs:', logs.length);
    console.log('Loading state:', loading);
    console.log('Profile switching:', profileSwitching);
    
    // If we're loading, switching profiles, or have no active profile, return zero stats
    if (loading || profileSwitching || !activeProfile) {
      console.log('Returning zero stats due to loading, switching, or no profile');
      return {
        weeklyAverageSleep: '0h 0m',
        weeklyFeedings: 0,
        weeklyDiaperChanges: 0
      };
    }

    // Safety check: only calculate stats if logs belong to current active profile
    const logsMatchProfile = logs.length === 0 || currentProfileId === activeProfile.id;
    if (!logsMatchProfile) {
      console.log('Logs do not match current profile, returning zero stats during transition');
      return {
        weeklyAverageSleep: '0h 0m',
        weeklyFeedings: 0,
        weeklyDiaperChanges: 0
      };
    }

    if (!logs.length) {
      console.log('No logs found, returning zero stats');
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
  }, [logs, loading, activeProfile?.id, profileSwitching, currentProfileId]);

  // Return loading state that includes profile switching
  return {
    stats,
    loading: loading || profileSwitching,
    hasActiveProfile: !!activeProfile
  };
};
