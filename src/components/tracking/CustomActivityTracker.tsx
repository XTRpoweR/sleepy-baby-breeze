
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Bath, Activity, Clock, Smile } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomActivityTrackerProps {
  babyId: string;
  onActivityAdded?: () => void;
}

export const CustomActivityTracker = ({ babyId, onActivityAdded }: CustomActivityTrackerProps) => {
  const { t } = useTranslation();
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const [activityType, setActivityType] = useState('');
  const [customName, setCustomName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const isMobile = useIsMobile();

  const PRESET_ACTIVITIES = [
    { id: 'tummy_time', name: t('tracking.customActivityTracker.tummyTime'), icon: Activity },
    { id: 'bath', name: t('tracking.customActivityTracker.bathTime'), icon: Bath },
    { id: 'playtime', name: t('tracking.customActivityTracker.playTime'), icon: Smile },
    { id: 'walk', name: t('tracking.customActivityTracker.walkOuting'), icon: Activity },
    { id: 'custom', name: t('tracking.customActivityTracker.customActivity'), icon: Plus }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !activityType) return;

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const duration = end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60)) : null;

    const activityName = activityType === 'custom' ? customName : 
      PRESET_ACTIVITIES.find(a => a.id === activityType)?.name || activityType;

    const success = await addActivity({
      baby_id: babyId,
      activity_type: 'custom',
      start_time: start.toISOString(),
      end_time: end?.toISOString() || null,
      duration_minutes: duration,
      notes: notes.trim() || null,
      metadata: {
        activity_name: activityName,
        activity_type: activityType
      }
    });

    if (success) {
      setStartTime('');
      setEndTime('');
      setNotes('');
      setCustomName('');
      setActivityType('');
    }
  };

  return (
    <Card className="rounded-3xl shadow-xl bg-gradient-to-br from-orange-500/5 via-card to-orange-500/10 border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 animate-pulse" />
          <span className="text-gradient">{t('tracking.customActivityTracker.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="activityType" className="text-sm sm:text-base">{t('tracking.customActivityTracker.activityTypeRequired')}</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('tracking.customActivityTracker.activityTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {PRESET_ACTIVITIES.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <SelectItem key={activity.id} value={activity.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-sm sm:text-base">{activity.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {activityType === 'custom' && (
            <div>
              <Label htmlFor="customName" className="text-sm sm:text-base">{t('tracking.customActivityTracker.customNameRequired')}</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t('tracking.customActivityTracker.customNamePlaceholder')}
                required
                className="mt-1"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-sm sm:text-base">{t('tracking.customActivityTracker.startTimeRequired')}</Label>
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
              <Label htmlFor="endTime" className="text-sm sm:text-base">{t('tracking.customActivityTracker.endTimeLabel')}</Label>
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
            <Label htmlFor="notes" className="text-sm sm:text-base">{t('tracking.customActivityTracker.notesLabel')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('tracking.customActivityTracker.notesPlaceholder')}
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700 py-2 sm:py-3"
            disabled={!startTime || !activityType || (activityType === 'custom' && !customName.trim()) || isSubmitting}
          >
            {isSubmitting ? t('tracking.customActivityTracker.submittingButton') : t('tracking.customActivityTracker.submitButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
