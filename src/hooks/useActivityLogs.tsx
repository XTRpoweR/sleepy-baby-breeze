
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  // Immediate effect when babyId changes
  useEffect(() => {
    console.log('useActivityLogs: babyId changed to:', babyId);
    
    // Clear logs immediately for visual feedback
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
