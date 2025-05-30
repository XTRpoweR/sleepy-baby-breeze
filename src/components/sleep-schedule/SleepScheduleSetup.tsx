
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Moon, Baby, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SleepScheduleData, ScheduleRecommendation } from '@/pages/SleepSchedule';

interface SleepScheduleSetupProps {
  babyId: string;
}

export const SleepScheduleSetup = ({ babyId }: SleepScheduleSetupProps) => {
  const { toast } = useToast();
  const [childAge, setChildAge] = useState<number>(6);
  const [currentBedtime, setCurrentBedtime] = useState('19:30');
  const [currentWakeTime, setCurrentWakeTime] = useState('07:00');
  const [napFrequency, setNapFrequency] = useState<'none' | 'one' | 'two' | 'three-plus'>('two');
  const [sleepChallenges, setSleepChallenges] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChallengeChange = (challenge: string, checked: boolean) => {
    if (checked) {
      setSleepChallenges([...sleepChallenges, challenge]);
    } else {
      setSleepChallenges(sleepChallenges.filter(c => c !== challenge));
    }
  };

  const generateRecommendation = (data: SleepScheduleData): ScheduleRecommendation => {
    // Simple algorithm for generating sleep schedule recommendations based on age
    let recommendedBedtime = '19:00';
    let recommendedWakeTime = '07:00';
    let naps: Array<{ name: string; startTime: string; duration: number }> = [];
    let totalSleepHours = 12;

    if (data.childAge < 3) {
      // 0-3 months: frequent naps
      recommendedBedtime = '20:00';
      naps = [
        { name: 'Morning Nap', startTime: '09:00', duration: 90 },
        { name: 'Afternoon Nap', startTime: '13:00', duration: 120 },
        { name: 'Evening Nap', startTime: '16:30', duration: 45 }
      ];
      totalSleepHours = 14;
    } else if (data.childAge < 6) {
      // 3-6 months: 3 naps
      recommendedBedtime = '19:30';
      naps = [
        { name: 'Morning Nap', startTime: '09:30', duration: 60 },
        { name: 'Afternoon Nap', startTime: '13:30', duration: 90 },
        { name: 'Evening Nap', startTime: '17:00', duration: 30 }
      ];
      totalSleepHours = 13;
    } else if (data.childAge < 12) {
      // 6-12 months: 2 naps
      recommendedBedtime = '19:00';
      naps = [
        { name: 'Morning Nap', startTime: '10:00', duration: 60 },
        { name: 'Afternoon Nap', startTime: '14:00', duration: 90 }
      ];
      totalSleepHours = 12;
    } else if (data.childAge < 18) {
      // 12-18 months: transitioning to 1 nap
      recommendedBedtime = '19:30';
      naps = [
        { name: 'Afternoon Nap', startTime: '13:00', duration: 120 }
      ];
      totalSleepHours = 11.5;
    } else {
      // 18+ months: 1 nap
      recommendedBedtime = '20:00';
      naps = [
        { name: 'Afternoon Nap', startTime: '13:30', duration: 90 }
      ];
      totalSleepHours = 11;
    }

    return {
      bedtime: recommendedBedtime,
      wakeTime: recommendedWakeTime,
      naps,
      totalSleepHours
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const scheduleData: SleepScheduleData = {
      childAge,
      currentBedtime,
      currentWakeTime,
      napFrequency,
      sleepChallenges
    };

    const recommendation = generateRecommendation(scheduleData);

    try {
      const { error } = await supabase
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
          recommended_naps: recommendation.naps,
          total_sleep_hours: recommendation.totalSleepHours
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Sleep schedule created successfully",
      });

      // Refresh the page to show the new schedule
      window.location.reload();
    } catch (error) {
      console.error('Error creating sleep schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create sleep schedule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const challengeOptions = [
    'Difficulty falling asleep',
    'Frequent night wakings',
    'Early morning wake-ups',
    'Short naps',
    'Fighting naps',
    'Bedtime resistance'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Baby className="h-5 w-5 text-blue-600" />
            <span>Child Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="childAge">Child's Age (in months) *</Label>
            <Input
              id="childAge"
              type="number"
              min="0"
              max="60"
              value={childAge}
              onChange={(e) => setChildAge(parseInt(e.target.value) || 0)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span>Current Sleep Habits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentBedtime">Current Bedtime *</Label>
              <Input
                id="currentBedtime"
                type="time"
                value={currentBedtime}
                onChange={(e) => setCurrentBedtime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="currentWakeTime">Current Wake Time *</Label>
              <Input
                id="currentWakeTime"
                type="time"
                value={currentWakeTime}
                onChange={(e) => setCurrentWakeTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label>How many naps does your child currently take?</Label>
            <RadioGroup value={napFrequency} onValueChange={(value: 'none' | 'one' | 'two' | 'three-plus') => setNapFrequency(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="nap-none" />
                <Label htmlFor="nap-none">No naps</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one" id="nap-one" />
                <Label htmlFor="nap-one">1 nap per day</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="two" id="nap-two" />
                <Label htmlFor="nap-two">2 naps per day</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="three-plus" id="nap-three" />
                <Label htmlFor="nap-three">3+ naps per day</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-indigo-600" />
            <span>Sleep Challenges (Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengeOptions.map((challenge) => (
              <div key={challenge} className="flex items-center space-x-2">
                <Checkbox
                  id={challenge}
                  checked={sleepChallenges.includes(challenge)}
                  onCheckedChange={(checked) => handleChallengeChange(challenge, checked as boolean)}
                />
                <Label htmlFor={challenge} className="text-sm">
                  {challenge}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Schedule...' : 'Create Personalized Sleep Schedule'}
      </Button>
    </form>
  );
};
