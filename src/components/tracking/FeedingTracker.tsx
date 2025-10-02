
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DropletIcon as Bottle, Heart, Baby } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeedingTrackerProps {
  babyId: string;
  onActivityAdded?: () => void;
}

export const FeedingTracker = ({ babyId, onActivityAdded }: FeedingTrackerProps) => {
  const { t } = useTranslation();
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const [feedingType, setFeedingType] = useState<'breastfeeding' | 'formula' | 'both'>('breastfeeding');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quantity, setQuantity] = useState('');
  const [side, setSide] = useState<'left' | 'right' | 'both'>('left');
  const [notes, setNotes] = useState('');
  const isMobile = useIsMobile();

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
    <Card className="rounded-3xl shadow-xl bg-gradient-to-br from-info/5 via-card to-info/10 border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Bottle className="h-4 w-4 sm:h-5 sm:w-5 text-info animate-pulse" />
          <span className="text-gradient">{t('tracking.feedingTracker.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm sm:text-base">{t('tracking.feedingTracker.feedingTypeLabel')}</Label>
            <RadioGroup value={feedingType} onValueChange={(value: 'breastfeeding' | 'formula' | 'both') => setFeedingType(value)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breastfeeding" id="breastfeeding" />
                <Label htmlFor="breastfeeding" className="flex items-center space-x-2 text-sm sm:text-base">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{t('tracking.feedingTracker.breastfeedingLabel')}</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="formula" id="formula" />
                <Label htmlFor="formula" className="flex items-center space-x-2 text-sm sm:text-base">
                  <Bottle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{t('tracking.feedingTracker.formulaLabel')}</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex items-center space-x-2 text-sm sm:text-base">
                  <Baby className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{t('tracking.feedingTracker.bothLabel')}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {feedingType === 'breastfeeding' && (
            <div>
              <Label className="text-sm sm:text-base">{t('tracking.feedingTracker.breastSideLabel')}</Label>
              <RadioGroup value={side} onValueChange={(value: 'left' | 'right' | 'both') => setSide(value)} className="mt-2">
                <div className={`grid grid-cols-3 gap-2 ${isMobile ? 'text-sm' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="left" />
                    <Label htmlFor="left" className="text-sm sm:text-base">{t('tracking.feedingTracker.leftLabel')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="right" />
                    <Label htmlFor="right" className="text-sm sm:text-base">{t('tracking.feedingTracker.rightLabel')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both-sides" />
                    <Label htmlFor="both-sides" className="text-sm sm:text-base">{t('tracking.feedingTracker.bothSidesLabel')}</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-sm sm:text-base">{t('tracking.feedingTracker.startTimeRequired')}</Label>
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
              <Label htmlFor="endTime" className="text-sm sm:text-base">{t('tracking.feedingTracker.endTimeLabel')}</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {(feedingType === 'formula' || feedingType === 'both') && (
            <div>
              <Label htmlFor="quantity" className="text-sm sm:text-base">{t('tracking.feedingTracker.quantityLabel')}</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t('tracking.feedingTracker.quantityPlaceholder')}
                className="mt-1"
              />
            </div>
          )}

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
            className="w-full bg-green-600 hover:bg-green-700 py-2 sm:py-3"
            disabled={!startTime || isSubmitting}
          >
            {isSubmitting ? t('tracking.feedingTracker.submittingButton') : t('tracking.feedingTracker.submitButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
