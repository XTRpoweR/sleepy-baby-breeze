
import { useState } from 'react';
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
import { Baby } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeedingTrackerProps {
  babyId: string;
  onActivityAdded?: () => void;
}

export const FeedingTracker = ({ babyId, onActivityAdded }: FeedingTrackerProps) => {
  const { t } = useTranslation();
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const [feedingType, setFeedingType] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('ml');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !feedingType) return;

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const duration = end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60)) : null;

    const success = await addActivity({
      baby_id: babyId,
      activity_type: 'feeding',
      start_time: start.toISOString(),
      end_time: end?.toISOString() || null,
      duration_minutes: duration,
      notes: notes.trim() || null,
      metadata: {
        feeding_type: feedingType,
        amount: amount ? parseFloat(amount) : null,
        unit: unit
      }
    });

    if (success) {
      setFeedingType('');
      setAmount('');
      setStartTime('');
      setEndTime('');
      setNotes('');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Baby className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <span>{t('tracking.feedingTracker.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm sm:text-base">{t('tracking.feedingTracker.feedingTypeRequired')}</Label>
            <Select value={feedingType} onValueChange={setFeedingType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('tracking.feedingTracker.selectFeedingType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breastfeeding">{t('tracking.feedingTracker.breastfeeding')}</SelectItem>
                <SelectItem value="bottle">{t('tracking.feedingTracker.bottle')}</SelectItem>
                <SelectItem value="solid_food">{t('tracking.feedingTracker.solidFood')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {feedingType && feedingType !== 'breastfeeding' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="amount" className="text-sm sm:text-base">{t('tracking.feedingTracker.amountLabel')}</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="unit" className="text-sm sm:text-base">{t('tracking.feedingTracker.unitLabel')}</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="cups">{t('tracking.feedingTracker.cups')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="startTime" className="text-sm sm:text-base">{t('tracking.feedingTracker.startTimeRequired')}</Label>
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
            <Label htmlFor="endTime" className="text-sm sm:text-base">{t('tracking.feedingTracker.endTimeLabel')}</Label>
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
            <Label htmlFor="notes" className="text-sm sm:text-base">{t('tracking.feedingTracker.notesLabel')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('tracking.feedingTracker.notesPlaceholder')}
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 sm:py-3"
            disabled={!startTime || !feedingType || isSubmitting}
          >
            {isSubmitting ? t('tracking.feedingTracker.submittingButton') : t('tracking.feedingTracker.submitButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
