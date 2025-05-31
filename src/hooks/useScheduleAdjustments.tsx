
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { SleepScheduleData, ScheduleRecommendation } from '@/types/sleepSchedule';

interface ScheduleAdjustment {
  id: string;
  currentAge: number;
  newAge: number;
  suggestedSchedule: ScheduleRecommendation;
  reason: string;
  isApproved: boolean;
  isDismissed: boolean;
  createdAt: string;
}

export const useScheduleAdjustments = (babyId: string | null, currentSchedule: Tables<'sleep_schedules'> | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingAdjustments, setPendingAdjustments] = useState<ScheduleAdjustment[]>([]);
  const [loading, setLoading] = useState(false);

  // Check for age-based schedule adjustments
  const checkForAgeBasedAdjustments = async (babyBirthDate: string, latestSchedule: Tables<'sleep_schedules'>) => {
    const today = new Date();
    const birthDate = new Date(babyBirthDate);
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    
    const scheduleAge = latestSchedule.child_age;
    
    // If child has aged beyond their current schedule age by 1+ months
    if (ageInMonths > scheduleAge) {
      const newSchedule = generateAgeBasedSchedule(ageInMonths, latestSchedule);
      
      if (hasSignificantChanges(latestSchedule, newSchedule)) {
        const adjustment: ScheduleAdjustment = {
          id: `adj-${Date.now()}`,
          currentAge: scheduleAge,
          newAge: ageInMonths,
          suggestedSchedule: newSchedule,
          reason: getAdjustmentReason(scheduleAge, ageInMonths),
          isApproved: false,
          isDismissed: false,
          createdAt: new Date().toISOString()
        };
        
        setPendingAdjustments(prev => {
          // Avoid duplicates
          const exists = prev.some(adj => adj.newAge === ageInMonths);
          return exists ? prev : [...prev, adjustment];
        });
        
        toast({
          title: "Sleep Schedule Update Available",
          description: `Your child is now ${ageInMonths} months old. We have new schedule recommendations!`,
        });
      }
    }
  };

  const generateAgeBasedSchedule = (ageInMonths: number, currentSchedule: Tables<'sleep_schedules'>): ScheduleRecommendation => {
    // Age-based sleep recommendations
    let totalSleepHours: number;
    let napCount: number;
    let napDuration: number;
    let bedtimeAdjustment = 0; // minutes to adjust from current bedtime
    
    if (ageInMonths <= 3) {
      totalSleepHours = 16;
      napCount = 4;
      napDuration = 120;
    } else if (ageInMonths <= 6) {
      totalSleepHours = 14;
      napCount = 3;
      napDuration = 90;
      bedtimeAdjustment = 30; // Later bedtime
    } else if (ageInMonths <= 12) {
      totalSleepHours = 13;
      napCount = 2;
      napDuration = 75;
      bedtimeAdjustment = 15;
    } else if (ageInMonths <= 18) {
      totalSleepHours = 12.5;
      napCount = 1;
      napDuration = 90;
      bedtimeAdjustment = 30;
    } else {
      totalSleepHours = 12;
      napCount = 1;
      napDuration = 60;
      bedtimeAdjustment = 0;
    }

    // Calculate new bedtime
    const currentBedtime = new Date(`2024-01-01 ${currentSchedule.recommended_bedtime}`);
    currentBedtime.setMinutes(currentBedtime.getMinutes() + bedtimeAdjustment);
    
    const wakeTime = currentSchedule.recommended_wake_time;
    
    // Generate nap schedule
    const naps = [];
    const wakeHour = parseInt(wakeTime.split(':')[0]);
    
    for (let i = 0; i < napCount; i++) {
      const napTime = wakeHour + 2 + (i * 3);
      const napName = napCount === 1 ? 'Afternoon Nap' : 
                     i === 0 ? 'Morning Nap' :
                     i === 1 ? 'Afternoon Nap' :
                     i === 2 ? 'Late Afternoon Nap' : 'Evening Nap';
      
      naps.push({
        name: napName,
        startTime: `${napTime.toString().padStart(2, '0')}:00`,
        duration: napDuration
      });
    }

    return {
      bedtime: `${currentBedtime.getHours().toString().padStart(2, '0')}:${currentBedtime.getMinutes().toString().padStart(2, '0')}`,
      wakeTime,
      naps,
      totalSleepHours
    };
  };

  const hasSignificantChanges = (current: Tables<'sleep_schedules'>, suggested: ScheduleRecommendation): boolean => {
    const currentNaps = Array.isArray(current.recommended_naps) ? current.recommended_naps : [];
    const suggestedNaps = suggested.naps;
    
    // Check if bedtime changes by more than 15 minutes
    const currentBedtime = new Date(`2024-01-01 ${current.recommended_bedtime}`);
    const suggestedBedtime = new Date(`2024-01-01 ${suggested.bedtime}`);
    const bedtimeDiff = Math.abs(currentBedtime.getTime() - suggestedBedtime.getTime()) / (1000 * 60);
    
    // Check if nap count changes or total sleep hours change significantly
    const napCountChange = currentNaps.length !== suggestedNaps.length;
    const sleepHoursDiff = Math.abs(Number(current.total_sleep_hours) - suggested.totalSleepHours);
    
    return bedtimeDiff > 15 || napCountChange || sleepHoursDiff > 0.5;
  };

  const getAdjustmentReason = (oldAge: number, newAge: number): string => {
    if (newAge >= 18 && oldAge < 18) {
      return "Your toddler is ready for a single afternoon nap and later bedtime.";
    }
    if (newAge >= 12 && oldAge < 12) {
      return "Your baby can now transition to 2 naps per day with longer wake windows.";
    }
    if (newAge >= 6 && oldAge < 6) {
      return "Your baby's sleep is maturing - time for longer naps and more predictable bedtime.";
    }
    if (newAge >= 3 && oldAge < 3) {
      return "Your baby is developing better sleep patterns - fewer but longer naps recommended.";
    }
    return `Your child's sleep needs have evolved at ${newAge} months old.`;
  };

  const approveAdjustment = async (adjustmentId: string) => {
    const adjustment = pendingAdjustments.find(adj => adj.id === adjustmentId);
    if (!adjustment || !babyId) return;

    try {
      // Save the new schedule to database
      const scheduleData: SleepScheduleData = {
        childAge: adjustment.newAge,
        currentBedtime: currentSchedule?.current_bedtime || adjustment.suggestedSchedule.bedtime,
        currentWakeTime: currentSchedule?.current_wake_time || adjustment.suggestedSchedule.wakeTime,
        napFrequency: adjustment.suggestedSchedule.naps.length === 0 ? 'none' :
                     adjustment.suggestedSchedule.naps.length === 1 ? 'one' :
                     adjustment.suggestedSchedule.naps.length === 2 ? 'two' : 'three-plus',
        sleepChallenges: currentSchedule?.sleep_challenges || []
      };

      const { error } = await supabase
        .from('sleep_schedules')
        .insert({
          baby_id: babyId,
          child_age: adjustment.newAge,
          current_bedtime: scheduleData.currentBedtime,
          current_wake_time: scheduleData.currentWakeTime,
          nap_frequency: scheduleData.napFrequency,
          sleep_challenges: scheduleData.sleepChallenges,
          recommended_bedtime: adjustment.suggestedSchedule.bedtime,
          recommended_wake_time: adjustment.suggestedSchedule.wakeTime,
          recommended_naps: adjustment.suggestedSchedule.naps as any, // Cast to any for Json compatibility
          total_sleep_hours: adjustment.suggestedSchedule.totalSleepHours
        });

      if (error) throw error;

      // Remove from pending adjustments
      setPendingAdjustments(prev => prev.filter(adj => adj.id !== adjustmentId));
      
      toast({
        title: "Schedule Updated!",
        description: "Your child's sleep schedule has been updated based on their current age.",
      });
    } catch (error) {
      console.error('Error approving adjustment:', error);
      toast({
        title: "Error",
        description: "Failed to update sleep schedule",
        variant: "destructive",
      });
    }
  };

  const dismissAdjustment = (adjustmentId: string) => {
    setPendingAdjustments(prev => prev.filter(adj => adj.id !== adjustmentId));
    toast({
      title: "Suggestion Dismissed",
      description: "You can always create a new schedule manually if needed.",
    });
  };

  // Check for adjustments when baby profile or schedule changes
  useEffect(() => {
    const checkAdjustments = async () => {
      if (!babyId || !currentSchedule) return;
      
      setLoading(true);
      try {
        // Get baby profile to check birth date
        const { data: profile } = await supabase
          .from('baby_profiles')
          .select('birth_date')
          .eq('id', babyId)
          .single();

        if (profile?.birth_date) {
          await checkForAgeBasedAdjustments(profile.birth_date, currentSchedule);
        }
      } catch (error) {
        console.error('Error checking for adjustments:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdjustments();
  }, [babyId, currentSchedule]);

  return {
    pendingAdjustments,
    loading,
    approveAdjustment,
    dismissAdjustment
  };
};
