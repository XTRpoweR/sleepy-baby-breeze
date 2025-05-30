
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { SleepScheduleSetup } from '@/components/sleep-schedule/SleepScheduleSetup';
import { SleepScheduleDisplay } from '@/components/sleep-schedule/SleepScheduleDisplay';
import { SavedSchedules } from '@/components/sleep-schedule/SavedSchedules';
import { ScheduleAdjustmentNotifications } from '@/components/sleep-schedule/ScheduleAdjustmentNotifications';
import { Tables } from '@/integrations/supabase/types';
import { BabyGrowthTracker } from '@/components/growth/BabyGrowthTracker';
import { useBabyProfile } from '@/hooks/useBabyProfile';

// Type definitions for sleep schedule functionality
export interface SleepScheduleData {
  childAge: number;
  currentBedtime: string;
  currentWakeTime: string;
  napFrequency: 'none' | 'one' | 'two' | 'three-plus';
  sleepChallenges: string[];
}

export interface ScheduleRecommendation {
  bedtime: string;
  wakeTime: string;
  naps: Array<{
    name: string;
    startTime: string;
    duration: number;
  }>;
  totalSleepHours: number;
}

const SleepSchedule = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading, createProfile } = useBabyProfile();
  const [currentSchedule, setCurrentSchedule] = useState<Tables<'sleep_schedules'> | null>(null);
  const [pendingAdjustments, setPendingAdjustments] = useState<any[]>([]);

  useEffect(() => {
    const babyId = searchParams.get('baby');

    if (babyId && user) {
      fetchCurrentSchedule(babyId);
    }
  }, [searchParams, user]);

  const fetchCurrentSchedule = async (babyId: string) => {
    try {
      const { data: sleepSchedule, error } = await supabase
        .from('sleep_schedules')
        .select('*')
        .eq('baby_id', babyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching sleep schedule:", error);
        toast({
          title: "Error",
          description: "Failed to load sleep schedule",
          variant: "destructive",
        });
      }

      setCurrentSchedule(sleepSchedule || null);
    } catch (error) {
      console.error("Error fetching sleep schedule:", error);
      toast({
        title: "Error",
        description: "Failed to load sleep schedule",
        variant: "destructive",
      });
    }
  };

  const handleScheduleSelect = (schedule: Tables<'sleep_schedules'>) => {
    setCurrentSchedule(schedule);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Sleep Schedule & Growth Tracker</h1>
          <p className="text-muted-foreground">
            Manage your baby's sleep routine and track their growth development
          </p>
        </div>

        {!profile ? (
          <BabyProfileSetup onProfileCreated={createProfile} />
        ) : (
          <Tabs defaultValue="sleep-schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sleep-schedule">Sleep Schedule</TabsTrigger>
              <TabsTrigger value="growth-tracker">Growth Tracker</TabsTrigger>
            </TabsList>

            <TabsContent value="sleep-schedule" className="space-y-6">
              {pendingAdjustments.length > 0 && (
                <ScheduleAdjustmentNotifications
                  babyId={profile.id}
                  currentSchedule={currentSchedule}
                />
              )}

              {!currentSchedule ? (
                <SleepScheduleSetup 
                  babyId={profile.id}
                />
              ) : (
                <div className="grid gap-6">
                  <SleepScheduleDisplay schedule={currentSchedule} />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <SavedSchedules 
                      babyId={profile.id}
                      onViewSchedule={handleScheduleSelect}
                    />
                    <Card>
                      <CardHeader>
                        <CardTitle>Create New Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => window.location.reload()} 
                          variant="outline"
                          className="w-full"
                        >
                          Start Over with New Schedule
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="growth-tracker">
              <BabyGrowthTracker
                babyId={profile.id}
                babyName={profile.name}
                birthDate={profile.birth_date || ''}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SleepSchedule;
