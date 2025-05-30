
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Baby, Clock } from 'lucide-react';
import { SleepScheduleSetup } from '@/components/sleep-schedule/SleepScheduleSetup';
import { SleepScheduleDisplay } from '@/components/sleep-schedule/SleepScheduleDisplay';
import { useBabyProfile } from '@/hooks/useBabyProfile';

export interface SleepScheduleData {
  childAge: number; // in months
  currentBedtime: string;
  currentWakeTime: string;
  napFrequency: 'none' | 'one' | 'two' | 'three-plus';
  sleepChallenges: string[];
}

export interface ScheduleRecommendation {
  bedtime: string;
  wakeTime: string;
  naps: {
    name: string;
    startTime: string;
    duration: number; // in minutes
  }[];
  totalSleepHours: number;
}

const SleepSchedule = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useBabyProfile();
  const [scheduleData, setScheduleData] = useState<SleepScheduleData | null>(null);
  const [recommendation, setRecommendation] = useState<ScheduleRecommendation | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Baby className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Profile Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Please set up your baby's profile first to create a personalized sleep schedule.
            </p>
            <Button onClick={() => navigate('/track')} className="w-full">
              Set Up Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleScheduleSubmit = (data: SleepScheduleData) => {
    setScheduleData(data);
    // Generate recommendation based on the data
    const generated = generateSleepSchedule(data);
    setRecommendation(generated);
  };

  const generateSleepSchedule = (data: SleepScheduleData): ScheduleRecommendation => {
    // Basic sleep schedule generation logic based on age
    const { childAge, currentWakeTime } = data;
    
    // Age-based sleep recommendations (simplified)
    let totalSleepHours: number;
    let napCount: number;
    let napDuration: number;
    
    if (childAge <= 3) {
      // 0-3 months
      totalSleepHours = 16;
      napCount = 4;
      napDuration = 120;
    } else if (childAge <= 6) {
      // 4-6 months
      totalSleepHours = 14;
      napCount = 3;
      napDuration = 90;
    } else if (childAge <= 12) {
      // 7-12 months
      totalSleepHours = 13;
      napCount = 2;
      napDuration = 75;
    } else if (childAge <= 18) {
      // 13-18 months
      totalSleepHours = 12.5;
      napCount = 1;
      napDuration = 90;
    } else {
      // 19+ months
      totalSleepHours = 12;
      napCount = 1;
      napDuration = 60;
    }

    // Calculate bedtime based on wake time and total sleep needed
    const wakeTime = new Date(`2024-01-01 ${currentWakeTime}`);
    const nightSleep = totalSleepHours - (napCount * napDuration / 60);
    const bedtimeHour = wakeTime.getHours() - nightSleep;
    
    let bedtime = new Date(wakeTime);
    bedtime.setHours(bedtimeHour < 0 ? 24 + bedtimeHour : bedtimeHour);
    
    // Generate nap schedule
    const naps = [];
    const wakeHour = wakeTime.getHours();
    
    if (napCount >= 1) {
      // Morning nap (for younger babies) or afternoon nap
      const napTime = napCount > 1 ? wakeHour + 2 : wakeHour + 5;
      naps.push({
        name: napCount > 1 ? 'Morning Nap' : 'Afternoon Nap',
        startTime: `${napTime.toString().padStart(2, '0')}:00`,
        duration: napDuration
      });
    }
    
    if (napCount >= 2) {
      // Afternoon nap
      naps.push({
        name: 'Afternoon Nap',
        startTime: `${(wakeHour + 5).toString().padStart(2, '0')}:00`,
        duration: napDuration
      });
    }
    
    if (napCount >= 3) {
      // Late afternoon nap
      naps.push({
        name: 'Late Afternoon Nap',
        startTime: `${(wakeHour + 8).toString().padStart(2, '0')}:00`,
        duration: napDuration
      });
    }

    return {
      bedtime: `${bedtime.getHours().toString().padStart(2, '0')}:${bedtime.getMinutes().toString().padStart(2, '0')}`,
      wakeTime: currentWakeTime,
      naps,
      totalSleepHours
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sleep Schedule</h1>
              <p className="text-gray-600">Personalized sleep recommendations for {profile.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-purple-600">
            <Clock className="h-6 w-6" />
            <span className="font-medium">Sleep Planning</span>
          </div>
        </div>

        {!recommendation ? (
          <SleepScheduleSetup onSubmit={handleScheduleSubmit} profile={profile} />
        ) : (
          <SleepScheduleDisplay 
            recommendation={recommendation} 
            onReset={() => {
              setScheduleData(null);
              setRecommendation(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SleepSchedule;
