
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Clock, Play, Square } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';

interface SleepTrackerProps {
  babyId: string;
}

export const SleepTracker = ({ babyId }: SleepTrackerProps) => {
  const { addActivity, isSubmitting } = useActivityTracker();
  const [sleepType, setSleepType] = useState<'nap' | 'night'>('nap');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [activeStartTime, setActiveStartTime] = useState<Date | null>(null);

  const handleStartSleep = () => {
    const now = new Date();
    setActiveStartTime(now);
    setStartTime(now.toISOString().slice(0, 16));
    setIsActive(true);
  };

  const handleStopSleep = () => {
    if (activeStartTime) {
      const now = new Date();
      setEndTime(now.toISOString().slice(0, 16));
      setIsActive(false);
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
    const now = new Date();
    const minutes = Math.floor((now.getTime() - activeStartTime.getTime()) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Quick Start/Stop */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-blue-600" />
            <span>Sleep Session</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {isActive ? (
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatDuration()}
                </div>
                <p className="text-gray-600 mb-4">Sleep session in progress...</p>
                <Button onClick={handleStopSleep} className="bg-red-500 hover:bg-red-600">
                  <Square className="h-4 w-4 mr-2" />
                  End Sleep Session
                </Button>
              </div>
            ) : (
              <div>
                <Button onClick={handleStartSleep} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                  <Play className="h-5 w-5 mr-2" />
                  Start Sleep Session
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span>Log Sleep Manually</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Sleep Type</Label>
              <RadioGroup value={sleepType} onValueChange={(value: 'nap' | 'night') => setSleepType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nap" id="nap" />
                  <Label htmlFor="nap" className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span>Nap</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="night" id="night" />
                  <Label htmlFor="night" className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>Night Sleep</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

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
                placeholder="How was the sleep? Any observations..."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!startTime || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Log Sleep Session'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
