
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { profileEventManager } from '@/utils/profileEvents';

interface ActivityLog {
  id: string;
  activity_type: 'sleep' | 'feeding' | 'diaper' | 'custom';
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  metadata: any;
  created_at: string;
}

export const useActivityLogs = (babyId: string) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileSwitching, setProfileSwitching] = useState(false);
  const currentBabyIdRef = useRef(babyId);

  const fetchLogs = useCallback(async () => {
    if (!babyId) {
      console.log('No babyId provided to fetchLogs');
      setLogs([]);
      setLoading(false);
      return;
    }

    console.log('Fetching activity logs for baby:', babyId);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('baby_activities')
        .select('*')
        .eq('baby_id', babyId)
        .order('start_time', { ascending: false });

      // Check if babyId changed during the request
      if (currentBabyIdRef.current !== babyId) {
        console.log('BabyId changed during fetch, ignoring results');
        return;
      }

      if (error) {
        console.error('Error fetching activity logs:', error);
        toast({
          title: "Error",
          description: `Failed to load activity logs: ${error.message}`,
          variant: "destructive",
        });
        setLogs([]);
      } else {
        console.log('Successfully fetched activity logs:', data?.length || 0, 'records');
        // Type assertion to ensure activity_type matches our interface
        const typedData = (data || []).map(log => ({
          ...log,
          activity_type: log.activity_type as 'sleep' | 'feeding' | 'diaper' | 'custom'
        }));
        setLogs(typedData);
      }
    } catch (error) {
      console.error('Unexpected error fetching activity logs:', error);
      toast({
        title: "Error",
        description: "Unexpected error loading activity logs",
        variant: "destructive",
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [babyId, toast]);

  // Listen for profile switching to show immediate loading state
  useEffect(() => {
    const unsubscribeSwitching = profileEventManager.subscribeToSwitching(() => {
      console.log('useActivityLogs: Profile switching started - showing immediate loading state');
      setProfileSwitching(true);
      setLoading(true);
    });

    const unsubscribe = profileEventManager.subscribe((newProfileId, isImmediate) => {
      console.log('useActivityLogs: Profile changed to:', newProfileId, 'immediate:', isImmediate);
      
      // Always clear data immediately when profile changes
      setLogs([]);
      setLoading(true);
      setProfileSwitching(false);
      
      // Update the ref to track the current profile
      if (newProfileId !== currentBabyIdRef.current) {
        console.log('Profile ID changed, updating ref and clearing stale data');
        currentBabyIdRef.current = newProfileId || '';
      }
    });

    return () => {
      unsubscribeSwitching();
      unsubscribe();
    };
  }, []);

  // Immediate effect when babyId changes
  useEffect(() => {
    console.log('useActivityLogs: babyId changed from', currentBabyIdRef.current, 'to:', babyId);
    
    // Update the ref immediately
    currentBabyIdRef.current = babyId;
    
    // Clear logs immediately for visual feedback and set loading state
    setLogs([]);
    setLoading(true);
    
    // Fetch new logs immediately
    if (babyId) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [babyId, fetchLogs]);

  const deleteLog = async (logId: string): Promise<boolean> => {
    console.log('Attempting to delete log:', logId);
    
    try {
      const { error } = await supabase
        .from('baby_activities')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting activity log:', error);
        toast({
          title: "Error",
          description: `Failed to delete activity log: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Successfully deleted log:', logId);
      toast({
        title: "Success!",
        description: "Activity log deleted successfully",
      });
      
      // Refresh logs
      await fetchLogs();
      return true;
    } catch (error) {
      console.error('Unexpected error deleting activity log:', error);
      return false;
    }
  };

  const updateLog = async (logId: string, updates: Partial<ActivityLog>): Promise<boolean> => {
    console.log('Attempting to update log:', logId, 'with updates:', updates);
    
    try {
      const { error } = await supabase
        .from('baby_activities')
        .update(updates)
        .eq('id', logId);

      if (error) {
        console.error('Error updating activity log:', error);
        toast({
          title: "Error",
          description: `Failed to update activity log: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Successfully updated log:', logId);
      toast({
        title: "Success!",
        description: "Activity log updated successfully",
      });
      
      // Refresh logs
      await fetchLogs();
      return true;
    } catch (error) {
      console.error('Unexpected error updating activity log:', error);
      return false;
    }
  };

  return {
    logs,
    loading: loading || profileSwitching,
    deleteLog,
    updateLog,
    refetchLogs: fetchLogs
  };
};
