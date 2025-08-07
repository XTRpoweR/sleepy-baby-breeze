
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { securityUtils, rateLimiters } from '@/utils/securityUtils';

interface ActivityData {
  baby_id: string;
  activity_type: 'sleep' | 'feeding' | 'diaper' | 'custom';
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  metadata: any;
}

export const useActivityTracker = (onActivityAdded?: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addActivity = async (activityData: ActivityData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add activities.",
        variant: "destructive",
      });
      return false;
    }

    // Rate limiting check
    if (!rateLimiters.activitySubmission.isAllowed(user.id)) {
      const remainingTime = Math.ceil(rateLimiters.activitySubmission.getRemainingTime(user.id) / 1000);
      toast({
        title: "Too Many Requests",
        description: `Please wait ${remainingTime} seconds before adding another activity.`,
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Validate and sanitize activity data
      const sanitizedData = { ...activityData };
      
      if (sanitizedData.notes) {
        const notesValidation = securityUtils.validateActivityNotes(sanitizedData.notes);
        if (!notesValidation.isValid) {
          toast({
            title: "Invalid Notes",
            description: notesValidation.error,
            variant: "destructive",
          });
          return false;
        }
        sanitizedData.notes = notesValidation.sanitized;
      }

      // Validate activity type
      const validActivityTypes = ['sleep', 'feeding', 'diaper', 'custom'];
      if (!validActivityTypes.includes(sanitizedData.activity_type)) {
        toast({
          title: "Invalid Activity Type",
          description: "Please select a valid activity type.",
          variant: "destructive",
        });
        return false;
      }

      // Validate timestamps
      const startTime = new Date(sanitizedData.start_time);
      const now = new Date();
      
      if (startTime > new Date(now.getTime() + 60 * 60 * 1000)) { // Allow 1 hour in future
        toast({
          title: "Invalid Start Time",
          description: "Activity start time cannot be more than 1 hour in the future.",
          variant: "destructive",
        });
        return false;
      }

      if (sanitizedData.end_time) {
        const endTime = new Date(sanitizedData.end_time);
        if (endTime < startTime) {
          toast({
            title: "Invalid End Time",
            description: "Activity end time cannot be before start time.",
            variant: "destructive",
          });
          return false;
        }
      }

      const { error } = await supabase
        .from('baby_activities')
        .insert(sanitizedData);

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
      
      // Call the callback to refresh data immediately
      if (onActivityAdded) {
        onActivityAdded();
      }
      
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
