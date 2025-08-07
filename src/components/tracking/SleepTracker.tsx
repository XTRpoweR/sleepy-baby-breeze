
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Play, Square } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useIsMobile } from '@/hooks/use-mobile';

interface SleepTrackerProps {
  babyId: string;
  onActivityAdded?: () => void;
}

export const SleepTracker = ({ babyId, onActivityAdded }: SleepTrackerProps) => {
  const { t } = useTranslation();
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const [sleepType, setSleepType] = useState<'nap' | 'night'>('nap');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [activeStartTime, setActiveStartTime] = useState<Date | null>(null);
  const isMobile = useIsMobile();

  const startSleepSession = () => {
    const now = new Date();
    setActiveStartTime(now);
    setIsActive(true);
  };

  const endSleepSession = async () => {
    if (!activeStartTime) return;

    const endDateTime = new Date();
    const duration = Math.round((endDateTime.getTime() - activeStartTime.getTime()) / (1000 * 60));

    const success = await addActivity({
      baby_id: babyId,
      activity_type: 'sleep',
      start_time: activeStartTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_minutes: duration,
      notes: notes.trim() || null,
      metadata: {
        type: sleepType,
        session: true
      }
    });

    if (success) {
      setIsActive(false);
      setActiveStartTime(null);
      setNotes('');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime) return;

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const duration = end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60)) : null;

    const success = await addActivity({
      baby_id: babyId,
      activity_type: 'sleep',
      start_time: start.toISOString(),
      end_time: end?.toISOString() || null,
      duration_minutes: duration,
      notes: notes.trim() || null,
      metadata: {
        type: sleepType,
        session: false
      }
    });

    if (success) {
      setStartTime('');
      setEndTime('');
      setNotes('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Sleep Session */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span>{t('tracking.sleepTracker.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!isActive ? (
            <Button 
              onClick={startSleepSession}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 sm:py-3"
              disabled={isSubmitting}
            >
              <Play className="h-4 w-4 mr-2" />
              {t('tracking.sleepTracker.startSession')}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('tracking.sleepTracker.sessionStarted')}
                </p>
                <p className="text-lg font-medium">
                  {activeStartTime?.toLocaleTimeString()}
                </p>
              </div>
              <Button 
                onClick={endSleepSession}
                className="w-full bg-red-600 hover:bg-red-700 py-2 sm:py-3"
                disabled={isSubmitting}
              >
                <Square className="h-4 w-4 mr-2" />
                {t('tracking.sleepTracker.endSession')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Sleep Log */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            <span>{t('tracking.sleepTracker.manualTitle')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label className="text-sm sm:text-base">{t('tracking.sleepTracker.sleepTypeLabel')}</Label>
              <RadioGroup 
                value={sleepType} 
                onValueChange={(value: 'nap' | 'night') => setSleepType(value)}
                className="flex flex-row space-x-6 mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nap" id="nap" />
                  <Label htmlFor="nap" className="flex items-center space-x-2 text-sm sm:text-base">
                    <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    <span>{t('tracking.sleepTracker.napLabel')}</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="night" id="night" />
                  <Label htmlFor="night" className="flex items-center space-x-2 text-sm sm:text-base">
                    <Moon className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500" />
                    <span>{t('tracking.sleepTracker.nightLabel')}</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="startTime" className="text-sm sm:text-base">{t('tracking.sleepTracker.startTimeRequired')}</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1"
                lang="en"
              />
            </div>

            <div>
              <Label htmlFor="endTime" className="text-sm sm:text-base">{t('tracking.sleepTracker.endTimeLabel')}</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
                lang="en"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm sm:text-base">{t('tracking.sleepTracker.notesLabel')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('tracking.sleepTracker.notesPlaceholder')}
                rows={3}
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 py-2 sm:py-3"
              disabled={!startTime || isSubmitting}
            >
              {isSubmitting ? t('tracking.sleepTracker.submittingButton') : t('tracking.sleepTracker.submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
