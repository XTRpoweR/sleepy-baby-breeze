
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Moon, Sun, Clock, Play, Square, Sparkles, TrendingUp } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { usePersistentSleepSession } from '@/hooks/usePersistentSleepSession';

interface SleepTrackerProps {
  babyId: string;
  onActivityAdded?: () => void;
}

export const SleepTracker = ({ babyId, onActivityAdded }: SleepTrackerProps) => {
  const { t } = useTranslation();
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const { activeSession, isActive, timerDisplay, startSession, clearSession, getDuration } = usePersistentSleepSession(babyId);
  
  const [sleepType, setSleepType] = useState<'nap' | 'night'>('nap');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [sessionDuration, setSessionDuration] = useState({ hours: 0, minutes: 0 });
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Show toast when resuming an existing session
  useEffect(() => {
    if (activeSession && isActive) {
      const duration = getDuration();
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      const durationText = hours > 0 
        ? `${hours}h ${minutes}m ago`
        : `${minutes}m ago`;
      
      toast({
        title: 'Sleep session resumed',
        description: `Continuing sleep session started ${durationText}`,
      });
    }
  }, []); // Only run once on mount

  const handleStartSleep = () => {
    startSession(sleepType, notes);
    toast({
      title: t('tracking.sleepTracker.sessionStarted'),
      description: t('tracking.sleepTracker.sessionStartedDesc'),
    });
  };

  const handleStopSleep = () => {
    if (!activeSession) return;

    const duration = getDuration();
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    setSessionDuration({ hours, minutes });
    setShowSummary(true);
  };

  const handleSaveSession = async () => {
    if (!activeSession) return;

    const start = new Date(activeSession.startTime);
    const end = new Date();
    const duration = getDuration();

    const success = await addActivity({
      baby_id: babyId,
      activity_type: 'sleep',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration_minutes: duration,
      notes: activeSession.notes?.trim() || notes.trim() || null,
      metadata: { 
        sleep_type: activeSession.sleepType,
        tracking_method: 'live_session'
      }
    });

    if (success) {
      clearSession();
      setShowSummary(false);
      setStartTime('');
      setEndTime('');
      setNotes('');
      
      toast({
        title: t('tracking.sleepTracker.saved'),
        description: t('tracking.sleepTracker.sessionSaved'),
      });
    }
  };

  const handleCancelSession = () => {
    clearSession();
    setShowSummary(false);
    toast({
      title: t('tracking.sleepTracker.cancelled'),
      description: t('tracking.sleepTracker.sessionCancelled'),
    });
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
      metadata: { 
        sleep_type: sleepType,
        tracking_method: 'manual_log'
      }
    });

    if (success) {
      setStartTime('');
      setEndTime('');
      setNotes('');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sleep Session Summary - Drawer on mobile, Dialog on desktop */}
      {/* Mobile: Use Drawer (bottom sheet) for reliable iOS positioning */}
      <Drawer open={showSummary && isMobile} onOpenChange={setShowSummary}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle className="flex items-center justify-center gap-2 text-2xl">
              <Moon className="h-6 w-6 text-primary" />
              Sleep Session Complete
            </DrawerTitle>
            <DrawerDescription>
              Great job tracking your baby's sleep!
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="space-y-4 px-4 py-2">
            {/* Duration Display */}
            <div className="text-center space-y-1">
              <div className="text-sm text-muted-foreground font-medium">Total Sleep Duration</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {sessionDuration.hours}h {sessionDuration.minutes}m
              </div>
            </div>
            
            {/* Sleep Quality Indicator */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Sleep Insights</span>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Session successfully recorded</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>View detailed analytics in Reports</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Fixed at bottom with safe area */}
          <DrawerFooter className="flex-row gap-3 pb-6">
            <Button 
              onClick={handleCancelSession}
              variant="outline" 
              className="flex-1"
            >
              Cancel Session
            </Button>
            <Button 
              onClick={handleSaveSession}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              {isSubmitting ? t('tracking.sleepTracker.saving') : 'Save Session'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Desktop: Use Dialog (centered modal) */}
        <Dialog open={showSummary && !isMobile} onOpenChange={setShowSummary}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Moon className="h-6 w-6 text-primary" />
                Sleep Session Complete
              </DialogTitle>
              <DialogDescription>
                Great job tracking your baby's sleep!
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              {/* Duration Display */}
              <div className="text-center space-y-1">
                <div className="text-sm text-muted-foreground font-medium">Total Sleep Duration</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {sessionDuration.hours}h {sessionDuration.minutes}m
                </div>
              </div>
              
              {/* Sleep Quality Indicator */}
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Sleep Insights</span>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Session successfully recorded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>View detailed analytics in Reports</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <DialogFooter className="flex-row gap-3 sm:gap-3">
              <Button 
                onClick={handleCancelSession}
                variant="outline" 
                className="flex-1"
              >
                Cancel Session
              </Button>
              <Button 
                onClick={handleSaveSession}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
              >
                {isSubmitting ? t('tracking.sleepTracker.saving') : 'Save Session'}
              </Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Quick Start/Stop */}
      <Card className="rounded-3xl shadow-xl bg-gradient-to-br from-primary/5 via-card to-primary/10 border-2 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
            <div className="flex items-center space-x-2">
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-gradient">{t('tracking.sleepTracker.sleepSession')}</span>
            </div>
            {isActive && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs sm:text-sm text-green-600 font-medium">Active</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-3 sm:space-y-4">
            {isActive ? (
              <div className="space-y-4">
                {/* Large Prominent Timer */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 sm:p-8 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Moon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 animate-pulse" />
                    <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tabular-nums">
                      {timerDisplay}
                    </div>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base flex items-center justify-center gap-2">
                    <span className="inline-block animate-pulse">💤</span>
                    {t('tracking.sleepTracker.sessionInProgress')}
                  </p>
                </div>
                
                <Button 
                  onClick={handleStopSleep} 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                  size={isMobile ? "default" : "lg"}
                >
                  <Square className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('tracking.sleepTracker.endSleepSession')}
                </Button>
              </div>
            ) : (
              <div>
                <Button 
                  onClick={handleStartSleep} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 shadow-lg hover:shadow-xl transition-all"
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
