
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DropletIcon, Circle, Heart } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';

interface DiaperTrackerProps {
  babyId: string;
  onActivityAdded?: () => void;
}

export const DiaperTracker = ({ babyId, onActivityAdded }: DiaperTrackerProps) => {
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const [changeTime, setChangeTime] = useState('');
  const [isWet, setIsWet] = useState(false);
  const [isSoiled, setIsSoiled] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTime || (!isWet && !isSoiled)) return;

    const changeDateTime = new Date(changeTime);

    const success = await addActivity({
      baby_id: babyId,
      activity_type: 'diaper',
      start_time: changeDateTime.toISOString(),
      end_time: changeDateTime.toISOString(),
      duration_minutes: null,
      notes: notes.trim() || null,
      metadata: {
        wet: isWet,
        soiled: isSoiled,
        type: isWet && isSoiled ? 'both' : isWet ? 'wet' : 'soiled'
      }
    });

    if (success) {
      setChangeTime('');
      setIsWet(false);
      setIsSoiled(false);
      setNotes('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-pink-600" />
          <span>Diaper Change</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="changeTime">Change Time *</Label>
            <Input
              id="changeTime"
              type="datetime-local"
              value={changeTime}
              onChange={(e) => setChangeTime(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Diaper Contents *</Label>
            <div className="space-y-3 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="wet" 
                  checked={isWet}
                  onCheckedChange={(checked) => setIsWet(!!checked)}
                />
                <Label htmlFor="wet" className="flex items-center space-x-2">
                  <DropletIcon className="h-4 w-4 text-blue-500" />
                  <span>Wet</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="soiled" 
                  checked={isSoiled}
                  onCheckedChange={(checked) => setIsSoiled(!!checked)}
                />
                <Label htmlFor="soiled" className="flex items-center space-x-2">
                  <Circle className="h-4 w-4 text-yellow-600" />
                  <span>Soiled</span>
                </Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations about the diaper change..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-pink-600 hover:bg-pink-700"
            disabled={!changeTime || (!isWet && !isSoiled) || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Log Diaper Change'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
