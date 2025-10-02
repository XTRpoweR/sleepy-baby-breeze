
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Clock, Play, Square } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Real-time timer updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && activeStartTime) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, activeStartTime]);

  const handleStartSleep = () => {
    const now = new Date();
    setActiveStartTime(now);
    setStartTime(now.toISOString().slice(0, 16));
    setIsActive(true);
    
    toast({
      title: t('tracking.sleepTracker.sessionStarted'),
      description: t('tracking.sleepTracker.sessionStartedDesc'),
    });
  };

  const handleStopSleep = () => {
    if (activeStartTime) {
      const now = new Date();
      setEndTime(now.toISOString().slice(0, 16));
      setIsActive(false);
      
      const duration = Math.round((now.getTime() - activeStartTime.getTime()) / (1000 * 60));
      toast({
        title: t('tracking.sleepTracker.sessionEnded'),
        description: `${t('common.duration')}: ${Math.floor(duration / 60)}h ${duration % 60}m`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      metadata: { sleep_type: sleepType }
    });

    if (success) {
      setStartTime('');
      setEndTime('');
      setNotes('');
      setIsActive(false);
      setActiveStartTime(null);
    }
  };

  const formatDuration = () => {
    if (!activeStartTime) return '';
    const totalSeconds = Math.floor((currentTime.getTime() - activeStartTime.getTime()) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Start/Stop */}
      <Card className="rounded-3xl shadow-xl bg-gradient-to-br from-primary/5 via-card to-primary/10 border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
            <span className="text-gradient">{t('tracking.sleepTracker.sleepSession')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-3 sm:space-y-4">
            {isActive ? (
              <div>
                <div className={`text-xl sm:text-2xl font-bold text-blue-600 mb-2 ${isActive ? 'animate-pulse' : ''}`}>
                  {formatDuration()}
                </div>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{t('tracking.sleepTracker.sessionInProgress')}</p>
                <Button 
                  onClick={handleStopSleep} 
                  className="bg-red-500 hover:bg-red-600 w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3"
                  size={isMobile ? "default" : "lg"}
                >
                  <Square className="h-4 w-4 mr-2" />
                  {t('tracking.sleepTracker.endSleepSession')}
                </Button>
              </div>
            ) : (
              <div>
                <Button 
                  onClick={handleStartSleep} 
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3"
                  size={isMobile ? "default" : "lg"}
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('tracking.sleepTracker.startSleepSession')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Form */}
      <Card className="rounded-3xl shadow-xl bg-gradient-to-br from-primary/5 via-card to-secondary/10 border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="text-gradient">{t('tracking.sleepTracker.logManually')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm sm:text-base">{t('tracking.sleepTracker.sleepType')}</Label>
              <RadioGroup value={sleepType} onValueChange={(value: 'nap' | 'night') => setSleepType(value)} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nap" id="nap" />
                  <Label htmlFor="nap" className="flex items-center space-x-2 text-sm sm:text-base">
                    <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{t('tracking.sleepTracker.nap')}</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="night" id="night" />
                  <Label htmlFor="night" className="flex items-center space-x-2 text-sm sm:text-base">
                    <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{t('tracking.sleepTracker.nightSleep')}</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-sm sm:text-base">{t('tracking.sleepTracker.startTime')} *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-sm sm:text-base">{t('tracking.sleepTracker.endTime')}</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm sm:text-base">{t('tracking.sleepTracker.notes')} ({t('forms.optional')})</Label>
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
              {isSubmitting ? t('tracking.sleepTracker.saving') : t('tracking.sleepTracker.logSleep')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
