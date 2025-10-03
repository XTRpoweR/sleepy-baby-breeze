
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SleepScheduleData, ScheduleRecommendation } from '@/types/sleepSchedule';
import { Tables } from '@/integrations/supabase/types';

type SavedSleepSchedule = Tables<'sleep_schedules'>;

export const useSleepSchedule = (babyId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<SavedSleepSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && babyId) {
      fetchSleepSchedules();
    } else {
      setLoading(false);
    }
  }, [user, babyId]);

  const fetchSleepSchedules = async () => {
    if (!user || !babyId) return;

    console.log('Fetching sleep schedules for baby:', babyId, 'user:', user.id);

    try {
      const { data, error } = await supabase
        .from('sleep_schedules')
        .select('*')
        .eq('baby_id', babyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sleep schedules:', error);
        toast({
          title: "Error",
          description: `Failed to load sleep schedules: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Successfully fetched sleep schedules:', data?.length || 0);
        setSchedules(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching sleep schedules:', error);
      toast({
        title: "Error",
        description: "Unexpected error loading sleep schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSleepSchedule = async (
    scheduleData: SleepScheduleData,
    recommendation: ScheduleRecommendation
  ) => {
    if (!user || !babyId) return null;

    console.log('Saving sleep schedule for baby:', babyId);

    try {
      const { data, error } = await supabase
        .from('sleep_schedules')
        .insert({
          baby_id: babyId,
          child_age: scheduleData.childAge,
          current_bedtime: scheduleData.currentBedtime,
          current_wake_time: scheduleData.currentWakeTime,
          nap_frequency: scheduleData.napFrequency,
          sleep_challenges: scheduleData.sleepChallenges,
          recommended_bedtime: recommendation.bedtime,
          recommended_wake_time: recommendation.wakeTime,
          recommended_naps: recommendation.naps as any,
          total_sleep_hours: recommendation.totalSleepHours
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving sleep schedule:', error);
        toast({
          title: "Error",
          description: `Failed to save sleep schedule: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      console.log('Successfully saved sleep schedule:', data.id);
      toast({
        title: "Success!",
        description: "Sleep schedule saved successfully",
      });

      fetchSleepSchedules();
      return data;
    } catch (error) {
      console.error('Unexpected error saving sleep schedule:', error);
      toast({
        title: "Error",
        description: "Unexpected error saving sleep schedule",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSleepSchedule = async (scheduleId: string) => {
    if (!user) return false;

    console.log('Deleting sleep schedule:', scheduleId);

    try {
      const { error } = await supabase
        .from('sleep_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) {
        console.error('Error deleting sleep schedule:', error);
        toast({
          title: "Error",
          description: `Failed to delete sleep schedule: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Successfully deleted sleep schedule:', scheduleId);
      toast({
        title: "Success!",
        description: "Sleep schedule deleted successfully",
      });

      fetchSleepSchedules();
      return true;
    } catch (error) {
      console.error('Unexpected error deleting sleep schedule:', error);
      toast({
        title: "Error",
        description: "Unexpected error deleting sleep schedule",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    schedules,
    loading,
    saveSleepSchedule,
    deleteSleepSchedule,
    refetch: fetchSleepSchedules
  };
};
