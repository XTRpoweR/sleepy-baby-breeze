
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  baby_id: string;
  activity_type: 'sleep' | 'feeding' | 'diaper' | 'custom';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  notes?: string;
  quantity?: number;
  unit?: string;
  diaper_type?: string;
  custom_activity_name?: string;
  created_at: string;
  updated_at: string;
}

export const useActivityLogs = (babyId: string, forceUpdateCounter?: number) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  console.log('useActivityLogs: babyId changed to:', babyId);
  console.log('useActivityLogs: forceUpdateCounter:', forceUpdateCounter);

  // Clear logs immediately when babyId changes
  useEffect(() => {
    if (!babyId) {
      console.log('useActivityLogs: No babyId, clearing logs');
      setLogs([]);
      setLoading(false);
      return;
    }

    console.log('useActivityLogs: babyId changed, clearing logs and fetching new data');
    setLogs([]); // Clear immediately
    setLoading(true);
    fetchLogs();
  }, [babyId]);

  // Also refetch when forceUpdateCounter changes
  useEffect(() => {
    if (babyId && forceUpdateCounter && forceUpdateCounter > 0) {
      console.log('useActivityLogs: Force update triggered, refetching data');
      setLoading(true);
      fetchLogs();
    }
  }, [forceUpdateCounter]);

  const fetchLogs = async () => {
    if (!babyId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      console.log('useActivityLogs: Fetching logs for baby:', babyId);
      
      const { data, error } = await supabase
        .from('baby_activities')
        .select('*')
        .eq('baby_id', babyId)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching activity logs:', error);
        toast({
          title: "Error",
          description: "Failed to load activity logs",
          variant: "destructive",
        });
        setLogs([]);
      } else {
        console.log('useActivityLogs: Fetched', data?.length || 0, 'logs');
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const refetchLogs = async () => {
    console.log('useActivityLogs: Manual refetch requested');
    setLoading(true);
    await fetchLogs();
  };

  const deleteLog = async (logId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('baby_activities')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting activity log:', error);
        toast({
          title: "Error",
          description: "Failed to delete activity log",
          variant: "destructive",
        });
        return false;
      }

      // Remove from local state
      setLogs(prev => prev.filter(log => log.id !== logId));
      
      toast({
        title: "Success",
        description: "Activity log deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Unexpected error deleting log:', error);
      return false;
    }
  };

  const updateLog = async (logId: string, updates: Partial<ActivityLog>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('baby_activities')
        .update(updates)
        .eq('id', logId)
        .select()
        .single();

      if (error) {
        console.error('Error updating activity log:', error);
        toast({
          title: "Error",
          description: "Failed to update activity log",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setLogs(prev => prev.map(log => log.id === logId ? { ...log, ...data } : log));
      
      toast({
        title: "Success",
        description: "Activity log updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Unexpected error updating log:', error);
      return false;
    }
  };

  return {
    logs,
    loading,
    deleteLog,
    updateLog,
    refetchLogs
  };
};
