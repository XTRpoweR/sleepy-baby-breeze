
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Bath, Activity, Clock, Smile } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';

interface CustomActivityTrackerProps {
  babyId: string;
}

const PRESET_ACTIVITIES = [
  { id: 'tummy_time', name: 'Tummy Time', icon: Activity },
  { id: 'bath', name: 'Bath Time', icon: Bath },
  { id: 'playtime', name: 'Play Time', icon: Smile },
  { id: 'walk', name: 'Walk/Outing', icon: Activity },
  { id: 'custom', name: 'Custom Activity', icon: Plus }
];

export const CustomActivityTracker = ({ babyId }: CustomActivityTrackerProps) => {
  const { addActivity, isSubmitting } = useActivityTracker();
  const [activityType, setActivityType] = useState('');
  const [customName, setCustomName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

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
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-orange-600" />
          <span>Custom Activities</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="activityType">Activity Type *</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select an activity" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_ACTIVITIES.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <SelectItem key={activity.id} value={activity.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{activity.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {activityType === 'custom' && (
            <div>
              <Label htmlFor="customName">Custom Activity Name *</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter activity name"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the activity go? Any observations..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={!startTime || !activityType || (activityType === 'custom' && !customName.trim()) || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Log Activity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
