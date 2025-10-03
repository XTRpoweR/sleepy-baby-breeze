import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Moon, Baby, Clock } from 'lucide-react';
import { SleepScheduleData } from '@/types/sleepSchedule';

interface SleepScheduleSetupProps {
  onSubmit: (data: SleepScheduleData) => void;
  profile: { name: string; birth_date?: string };
}

export const SleepScheduleSetup = ({ onSubmit, profile }: SleepScheduleSetupProps) => {
  const [childAge, setChildAge] = useState<number>(6);
  const [currentBedtime, setCurrentBedtime] = useState('19:30');
  const [currentWakeTime, setCurrentWakeTime] = useState('07:00');
  const [napFrequency, setNapFrequency] = useState<'none' | 'one' | 'two' | 'three-plus'>('two');
  const [sleepChallenges, setSleepChallenges] = useState<string[]>([]);
  const { t } = useTranslation();

  // Calculate age from birth_date if available
  const calculateAge = () => {
    if (profile.birth_date) {
      const birthDate = new Date(profile.birth_date);
      const today = new Date();
      const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                         (today.getMonth() - birthDate.getMonth());
      return Math.max(0, ageInMonths);
    }
    return 6; // default
  };

  // Reset form when profile changes
  useEffect(() => {
    setChildAge(calculateAge());
    setCurrentBedtime('19:30');
    setCurrentWakeTime('07:00');
    setNapFrequency('two');
    setSleepChallenges([]);
  }, [profile.birth_date, profile.name]);

  const handleChallengeChange = (challenge: string, checked: boolean) => {
    if (checked) {
      setSleepChallenges([...sleepChallenges, challenge]);
    } else {
      setSleepChallenges(sleepChallenges.filter(c => c !== challenge));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      childAge,
      currentBedtime,
      currentWakeTime,
      napFrequency,
      sleepChallenges
    });
  };

  // Updated challenge options to use translation keys
  const challengeOptions = [
    t('components.sleepSchedule.challengeDifficulty'),
    t('components.sleepSchedule.challengeNightWakings'),
    t('components.sleepSchedule.challengeEarlyWakeups'),
    t('components.sleepSchedule.challengeShortNaps'),
    t('components.sleepSchedule.challengeFightingNaps'),
    t('components.sleepSchedule.challengeBedtimeResistance')
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Baby className="h-5 w-5 text-blue-600" />
            <span>{t('components.sleepSchedule.childInformation')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="childAge">{t('components.sleepSchedule.childAge')} *</Label>
            <Input
              id="childAge"
              type="number"
              min="0"
              max="60"
              value={childAge}
              onChange={(e) => setChildAge(parseInt(e.target.value) || 0)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {profile.birth_date ? t('components.sleepSchedule.childAgeCalculated') : t('components.sleepSchedule.childAgeHelper')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span>{t('components.sleepSchedule.currentSleepHabits')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentBedtime">{t('components.sleepSchedule.currentBedtime')} *</Label>
              <Input
                id="currentBedtime"
                type="time"
                value={currentBedtime}
                onChange={(e) => setCurrentBedtime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="currentWakeTime">{t('components.sleepSchedule.currentWakeTime')} *</Label>
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
            <Label>{t('components.sleepSchedule.napFrequency')}</Label>
            <RadioGroup value={napFrequency} onValueChange={(value: 'none' | 'one' | 'two' | 'three-plus') => setNapFrequency(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="nap-none" />
                <Label htmlFor="nap-none">{t('components.sleepSchedule.noNaps')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one" id="nap-one" />
                <Label htmlFor="nap-one">{t('components.sleepSchedule.oneNap')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="two" id="nap-two" />
                <Label htmlFor="nap-two">{t('components.sleepSchedule.twoNaps')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="three-plus" id="nap-three" />
                <Label htmlFor="nap-three">{t('components.sleepSchedule.threePlusNaps')}</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-indigo-600" />
            <span>
              {t('components.sleepSchedule.sleepChallenges')}
              <span className="ml-1 text-gray-400 text-sm">({t('components.sleepSchedule.optional')})</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengeOptions.map((challenge, idx) => (
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
      >
        {t('components.sleepSchedule.createSchedule')}
      </Button>
    </form>
  );
};
