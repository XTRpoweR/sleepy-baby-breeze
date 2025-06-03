
import { useState } from 'react';
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

const PRESET_ACTIVITIES = [
  { id: 'tummy_time', name: 'Tummy Time', icon: Activity },
  { id: 'bath', name: 'Bath Time', icon: Bath },
  { id: 'playtime', name: 'Play Time', icon: Smile },
  { id: 'walk', name: 'Walk/Outing', icon: Activity },
  { id: 'custom', name: 'Custom Activity', icon: Plus }
];

export const CustomActivityTracker = ({ babyId, onActivityAdded }: CustomActivityTrackerProps) => {
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const [activityType, setActivityType] = useState('');
  const [customName, setCustomName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const isMobile = useIsMobile();

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
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          <span>Custom Activities</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="activityType" className="text-sm sm:text-base">Activity Type *</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select an activity" />
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
              <Label htmlFor="customName" className="text-sm sm:text-base">Custom Activity Name *</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter activity name"
                required
                className="mt-1"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-sm sm:text-base">Start Time *</Label>
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
              <Label htmlFor="endTime" className="text-sm sm:text-base">End Time</Label>
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
            <Label htmlFor="notes" className="text-sm sm:text-base">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the activity go? Any observations..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700 py-2 sm:py-3"
            disabled={!startTime || !activityType || (activityType === 'custom' && !customName.trim()) || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Log Activity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
