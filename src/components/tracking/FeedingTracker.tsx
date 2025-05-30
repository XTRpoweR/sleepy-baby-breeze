
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DropletIcon as Bottle, Heart, Baby } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';

interface FeedingTrackerProps {
  babyId: string;
}

export const FeedingTracker = ({ babyId }: FeedingTrackerProps) => {
  const { addActivity, isSubmitting } = useActivityTracker();
  const [feedingType, setFeedingType] = useState<'breastfeeding' | 'formula' | 'both'>('breastfeeding');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quantity, setQuantity] = useState('');
  const [side, setSide] = useState<'left' | 'right' | 'both'>('left');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime) return;

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const duration = end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60)) : null;

    const metadata: any = { 
      feeding_type: feedingType,
      quantity: quantity ? parseFloat(quantity) : null
    };

    if (feedingType === 'breastfeeding') {
      metadata.side = side;
    }

    const success = await addActivity({
      baby_id: babyId,
      activity_type: 'feeding',
      start_time: start.toISOString(),
      end_time: end?.toISOString() || null,
      duration_minutes: duration,
      notes: notes.trim() || null,
      metadata
    });

    if (success) {
      setStartTime('');
      setEndTime('');
      setQuantity('');
      setNotes('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bottle className="h-5 w-5 text-green-600" />
          <span>Feeding Tracker</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Feeding Type</Label>
            <RadioGroup value={feedingType} onValueChange={(value: 'breastfeeding' | 'formula' | 'both') => setFeedingType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breastfeeding" id="breastfeeding" />
                <Label htmlFor="breastfeeding" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Breastfeeding</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="formula" id="formula" />
                <Label htmlFor="formula" className="flex items-center space-x-2">
                  <Bottle className="h-4 w-4" />
                  <span>Formula</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex items-center space-x-2">
                  <Baby className="h-4 w-4" />
                  <span>Both</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {feedingType === 'breastfeeding' && (
            <div>
              <Label>Breast Side</Label>
              <RadioGroup value={side} onValueChange={(value: 'left' | 'right' | 'both') => setSide(value)}>
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="left" />
                    <Label htmlFor="left">Left</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="right" />
                    <Label htmlFor="right">Right</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both-sides" />
                    <Label htmlFor="both-sides">Both</Label>
                  </div>
                </div>
              </RadioGroup>
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

          {(feedingType === 'formula' || feedingType === 'both') && (
            <div>
              <Label htmlFor="quantity">Quantity (ml/oz)</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Amount consumed"
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did feeding go? Any observations..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!startTime || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Log Feeding'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
