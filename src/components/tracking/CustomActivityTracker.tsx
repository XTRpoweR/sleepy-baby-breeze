
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomActivityTrackerProps {
  babyId: string;
  onActivityAdded?: () => void;
}

export const CustomActivityTracker = ({ babyId, onActivityAdded }: CustomActivityTrackerProps) => {
  const { t } = useTranslation();
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const [customActivities, setCustomActivities] = useState<Array<{id: string, name: string}>>([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [newActivityName, setNewActivityName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const isMobile = useIsMobile();

  // Load predefined custom activities from local storage or default list
  useEffect(() => {
    loadCustomActivities();
  }, [babyId]);

  const loadCustomActivities = () => {
    // Load from localStorage for this baby, or use default activities
    const storageKey = `custom_activities_${babyId}`;
    const stored = localStorage.getItem(storageKey);
    
    const defaultActivities = [
      { id: 'tummy_time', name: 'Tummy Time' },
      { id: 'bath', name: 'Bath Time' },
      { id: 'play', name: 'Play Time' },
      { id: 'walk', name: 'Walk/Outing' },
      { id: 'medication', name: 'Medication' },
      { id: 'doctor_visit', name: 'Doctor Visit' }
    ];

    if (stored) {
      try {
        const parsedActivities = JSON.parse(stored);
        setCustomActivities([...defaultActivities, ...parsedActivities]);
      } catch (error) {
        console.error('Error parsing stored activities:', error);
        setCustomActivities(defaultActivities);
      }
    } else {
      setCustomActivities(defaultActivities);
    }
  };

  const createCustomActivity = () => {
    if (!newActivityName.trim()) return;

    const newActivity = {
      id: `custom_${Date.now()}`,
      name: newActivityName.trim()
    };

    // Save to localStorage
    const storageKey = `custom_activities_${babyId}`;
    const existingCustom = localStorage.getItem(storageKey);
    let customList = [];
    
    if (existingCustom) {
      try {
        customList = JSON.parse(existingCustom);
      } catch (error) {
        console.error('Error parsing existing custom activities:', error);
      }
    }
    
    customList.push(newActivity);
    localStorage.setItem(storageKey, JSON.stringify(customList));

    // Update state
    setCustomActivities(prev => [...prev, newActivity]);
    setSelectedActivity(newActivity.id);
    setNewActivityName('');
    setIsCreatingNew(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !selectedActivity) return;

    const activity = customActivities.find(a => a.id === selectedActivity);
    if (!activity) return;

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const duration = end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60)) : null;

    const success = await addActivity({
      baby_id: babyId,
      activity_type: 'custom',
      start_time: start.toISOString(),
      end_time: end?.toISOString() || null,
      duration_minutes: duration,
      notes: notes.trim() || null,
      metadata: {
        activity_name: activity.name,
        custom_activity_id: selectedActivity
      }
    });

    if (success) {
      setStartTime('');
      setEndTime('');
      setNotes('');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          <span>{t('tracking.customActivityTracker.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm sm:text-base">{t('tracking.customActivityTracker.activityTypeRequired')}</Label>
            {!isCreatingNew ? (
              <div className="space-y-2 mt-1">
                <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('tracking.customActivityTracker.selectActivityPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {customActivities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('tracking.customActivityTracker.createNewButton')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 mt-1">
                <Input
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder={t('tracking.customActivityTracker.newActivityPlaceholder')}
                />
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={createCustomActivity}
                    className="flex-1"
                    disabled={!newActivityName.trim()}
                  >
                    {t('tracking.customActivityTracker.createButton')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setNewActivityName('');
                    }}
                  >
                    {t('tracking.customActivityTracker.cancelButton')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="startTime" className="text-sm sm:text-base">{t('tracking.customActivityTracker.startTimeRequired')}</Label>
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
            <Label htmlFor="endTime" className="text-sm sm:text-base">{t('tracking.customActivityTracker.endTimeLabel')}</Label>
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
            disabled={!startTime || !selectedActivity || isSubmitting}
          >
            {isSubmitting ? t('tracking.customActivityTracker.submittingButton') : t('tracking.customActivityTracker.submitButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
