
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
  const currentBabyIdRef = useRef(babyId);

  const fetchLogs = useCallback(async (specificBabyId?: string) => {
    const targetBabyId = specificBabyId || babyId;
    
    if (!targetBabyId) {
      console.log('No babyId provided to fetchLogs');
      setLogs([]);
      setLoading(false);
      return;
    }

    console.log('Fetching activity logs for baby:', targetBabyId);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('baby_activities')
        .select('*')
        .eq('baby_id', targetBabyId)
        .order('start_time', { ascending: false });

      // Check if babyId changed during the request
      if (currentBabyIdRef.current !== targetBabyId) {
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

  // Listen for profile changes to immediately clear data and refetch
  useEffect(() => {
    const unsubscribe = profileEventManager.subscribe((newProfileId) => {
      console.log('useActivityLogs: Profile changed event received for:', newProfileId);
      console.log('useActivityLogs: Current babyId prop:', babyId);
      console.log('useActivityLogs: Current ref value:', currentBabyIdRef.current);
      
      // Clear data immediately when profile changes
      setLogs([]);
      setLoading(true);
      
      // Always trigger fetch for the new profile ID, regardless of current state
      if (newProfileId) {
        console.log('Triggering immediate fetch for new profile:', newProfileId);
        currentBabyIdRef.current = newProfileId;
        // Small delay to ensure the profile switch is complete
        setTimeout(() => {
          // Call fetchLogs but make sure we're using the new profile ID
          if (currentBabyIdRef.current === newProfileId) {
            fetchLogs(newProfileId);
          }
        }, 50);
      }
    });

    return unsubscribe;
  }, [fetchLogs]);

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
    loading,
    deleteLog,
    updateLog,
    refetchLogs: fetchLogs
  };
};
