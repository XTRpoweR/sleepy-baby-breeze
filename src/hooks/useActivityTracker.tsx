
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityData {
  baby_id: string;
  activity_type: 'sleep' | 'feeding' | 'diaper' | 'custom';
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  metadata: any;
}

export const useActivityTracker = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addActivity = async (activityData: ActivityData): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('baby_activities')
        .insert(activityData);

      if (error) {
        console.error('Error adding activity:', error);
        toast({
          title: "Error",
          description: "Failed to save activity. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success!",
        description: "Activity logged successfully",
      });
      return true;
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to save activity. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addActivity,
    isSubmitting
  };
};
