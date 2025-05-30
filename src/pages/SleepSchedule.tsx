import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BabyProfileSetup } from '@/components/baby-profile/BabyProfileSetup';
import { SleepScheduleSetup } from '@/components/sleep-schedule/SleepScheduleSetup';
import { SleepScheduleDisplay } from '@/components/sleep-schedule/SleepScheduleDisplay';
import { SavedSchedules } from '@/components/sleep-schedule/SavedSchedules';
import { ScheduleAdjustmentNotifications } from '@/components/sleep-schedule/ScheduleAdjustmentNotifications';
import { Tables } from '@/integrations/supabase/types';
import { BabyGrowthTracker } from '@/components/growth/BabyGrowthTracker';

const SleepSchedule = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedBaby, setSelectedBaby] = useState<Tables<'baby_profiles'> | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<Tables<'sleep_schedules'> | null>(null);
  const [pendingAdjustments, setPendingAdjustments] = useState<any[]>([]);

  useEffect(() => {
    const babyId = searchParams.get('baby');

    if (babyId && user) {
      fetchBabyProfile(babyId);
      fetchCurrentSchedule(babyId);
    }
  }, [searchParams, user]);

  const fetchBabyProfile = async (babyId: string) => {
    try {
      const { data: babyProfile, error } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('id', babyId)
        .single();

      if (error) {
        console.error("Error fetching baby profile:", error);
        toast({
          title: "Error",
          description: "Failed to load baby profile",
          variant: "destructive",
        });
      }

      setSelectedBaby(babyProfile);
    } catch (error) {
      console.error("Error fetching baby profile:", error);
      toast({
        title: "Error",
        description: "Failed to load baby profile",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Sleep Schedule & Growth Tracker</h1>
          <p className="text-muted-foreground">
            Manage your baby's sleep routine and track their growth development
          </p>
        </div>

        {!selectedBaby ? (
          <BabyProfileSetup />
        ) : (
          <Tabs defaultValue="sleep-schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sleep-schedule">Sleep Schedule</TabsTrigger>
              <TabsTrigger value="growth-tracker">Growth Tracker</TabsTrigger>
            </TabsList>

            <TabsContent value="sleep-schedule" className="space-y-6">
              {pendingAdjustments.length > 0 && (
                <ScheduleAdjustmentNotifications
                  babyId={selectedBaby.id}
                  currentSchedule={currentSchedule}
                />
              )}

              {!currentSchedule ? (
                <SleepScheduleSetup babyId={selectedBaby.id} />
              ) : (
                <div className="grid gap-6">
                  <SleepScheduleDisplay schedule={currentSchedule} />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <SavedSchedules 
                      babyId={selectedBaby.id}
                      onScheduleSelect={handleScheduleSelect}
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
                babyId={selectedBaby.id}
                babyName={selectedBaby.name}
                birthDate={selectedBaby.birth_date || ''}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SleepSchedule;
