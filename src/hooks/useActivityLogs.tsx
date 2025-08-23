
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  baby_id: string;
  activity_type: 'sleep' | 'feeding' | 'diaper' | 'custom';
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  metadata: any;
  created_at: string;
  updated_at?: string;
  quantity?: number;
  unit?: string;
  diaper_type?: string;
  custom_activity_name?: string;
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
        // Map the database data to match our ActivityLog interface
        const mappedLogs: ActivityLog[] = (data || []).map(log => {
          // Safely parse metadata as an object
          const metadata = typeof log.metadata === 'object' && log.metadata !== null ? log.metadata as any : {};
          
          return {
            id: log.id,
            baby_id: log.baby_id,
            activity_type: log.activity_type as 'sleep' | 'feeding' | 'diaper' | 'custom',
            start_time: log.start_time,
            end_time: log.end_time,
            duration_minutes: log.duration_minutes,
            notes: log.notes,
            created_at: log.created_at,
            updated_at: log.created_at,
            metadata: metadata,
            // Add other fields that might be in metadata
            quantity: metadata?.quantity,
            unit: metadata?.unit,
            diaper_type: metadata?.diaper_type,
            custom_activity_name: metadata?.custom_activity_name,
          };
        });
        setLogs(mappedLogs);
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

      // Update local state with proper mapping
      setLogs(prev => prev.map(log => {
        if (log.id === logId) {
          // Safely parse metadata as an object
          const metadata = typeof data.metadata === 'object' && data.metadata !== null ? data.metadata as any : {};
          
          return {
            ...log,
            ...updates,
            id: data.id,
            baby_id: data.baby_id,
            activity_type: data.activity_type as 'sleep' | 'feeding' | 'diaper' | 'custom',
            start_time: data.start_time,
            end_time: data.end_time,
            duration_minutes: data.duration_minutes,
            notes: data.notes,
            created_at: data.created_at,
            updated_at: data.created_at,
            metadata: metadata,
          };
        }
        return log;
      }));
      
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
