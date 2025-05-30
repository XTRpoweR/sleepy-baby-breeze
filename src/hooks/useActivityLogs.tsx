
import { useState, useEffect } from 'react';
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

  const fetchLogs = async () => {
    if (!babyId) return;

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
          description: "Failed to load activity logs",
          variant: "destructive",
        });
      } else {
        // Type assertion to ensure activity_type matches our interface
        const typedData = (data || []).map(log => ({
          ...log,
          activity_type: log.activity_type as 'sleep' | 'feeding' | 'diaper' | 'custom'
        }));
        setLogs(typedData);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
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

      toast({
        title: "Success!",
        description: "Activity log deleted successfully",
      });
      
      // Refresh logs
      await fetchLogs();
      return true;
    } catch (error) {
      console.error('Error deleting activity log:', error);
      return false;
    }
  };

  const updateLog = async (logId: string, updates: Partial<ActivityLog>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('baby_activities')
        .update(updates)
        .eq('id', logId);

      if (error) {
        console.error('Error updating activity log:', error);
        toast({
          title: "Error",
          description: "Failed to update activity log",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success!",
        description: "Activity log updated successfully",
      });
      
      // Refresh logs
      await fetchLogs();
      return true;
    } catch (error) {
      console.error('Error updating activity log:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [babyId]);

  return {
    logs,
    loading,
    deleteLog,
    updateLog,
    refetchLogs: fetchLogs
  };
};
