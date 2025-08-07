
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DropletIcon, Circle, Heart } from 'lucide-react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useIsMobile } from '@/hooks/use-mobile';

interface DiaperTrackerProps {
  babyId: string;
  onActivityAdded?: () => void;
}

export const DiaperTracker = ({ babyId, onActivityAdded }: DiaperTrackerProps) => {
  const { t } = useTranslation();
  const { addActivity, isSubmitting } = useActivityTracker(onActivityAdded);
  const [changeTime, setChangeTime] = useState('');
  const [isWet, setIsWet] = useState(false);
  const [isSoiled, setIsSoiled] = useState(false);
  const [notes, setNotes] = useState('');
  const isMobile = useIsMobile();

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
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
          <span>{t('tracking.diaperTracker.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="changeTime" className="text-sm sm:text-base">{t('tracking.diaperTracker.changeTimeRequired')}</Label>
            <Input
              id="changeTime"
              type="datetime-local"
              value={changeTime}
              onChange={(e) => setChangeTime(e.target.value)}
              required
              className="mt-1"
              lang="en"
            />
          </div>

          <div>
            <Label className="text-sm sm:text-base">{t('tracking.diaperTracker.contentsRequired')}</Label>
            <div className="space-y-3 mt-3">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="wet" 
                  checked={isWet}
                  onCheckedChange={(checked) => setIsWet(!!checked)}
                />
                <Label htmlFor="wet" className="flex items-center space-x-2 text-sm sm:text-base">
                  <DropletIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  <span>{t('tracking.diaperTracker.wetLabel')}</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="soiled" 
                  checked={isSoiled}
                  onCheckedChange={(checked) => setIsSoiled(!!checked)}
                />
                <Label htmlFor="soiled" className="flex items-center space-x-2 text-sm sm:text-base">
                  <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                  <span>{t('tracking.diaperTracker.soiledLabel')}</span>
                </Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm sm:text-base">{t('tracking.diaperTracker.notesLabel')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('tracking.diaperTracker.notesPlaceholder')}
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-pink-600 hover:bg-pink-700 py-2 sm:py-3"
            disabled={!changeTime || (!isWet && !isSoiled) || isSubmitting}
          >
            {isSubmitting ? t('tracking.diaperTracker.submittingButton') : t('tracking.diaperTracker.submitButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
