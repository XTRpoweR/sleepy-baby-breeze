import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ActivityLog {
  id: string;
  activity_type: 'sleep' | 'feeding' | 'diaper' | 'custom';
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  metadata: any;
  created_at: string;
}

interface EditActivityDialogProps {
  log: any;
  open: boolean;
  onClose: () => void;
  babyId: string;
  updateLog: (logId: string, updates: Partial<ActivityLog>) => Promise<boolean>;
}

export const EditActivityDialog = ({ log, open, onClose, babyId, updateLog }: EditActivityDialogProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      setStartTime(new Date(log.start_time).toISOString().slice(0, 16));
      setEndTime(log.end_time ? new Date(log.end_time).toISOString().slice(0, 16) : '');
      setNotes(log.notes || '');
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const duration = end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60)) : null;

    const updates = {
      start_time: start.toISOString(),
      end_time: end?.toISOString() || null,
      duration_minutes: duration,
      notes: notes.trim() || null,
    };

    const success = await updateLog(log.id, updates);
    if (success) {
      onClose();
    }
    setIsSubmitting(false);
  };

  const getActivityTitle = () => {
    if (log?.activity_type === 'custom') {
      return log?.metadata?.activity_name || t('activities.custom');
    }
    return t(`activities.${log?.activity_type}`);
  };

  // Shared form content — rendered inside either Drawer or Dialog
  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="editStartTime">{t('tracking.editActivity.startTimeLabel')}</Label>
            <Input
              id="editStartTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="editEndTime">{t('tracking.editActivity.endTimeLabel')}</Label>
            <Input
              id="editEndTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="editNotes">{t('tracking.editActivity.notesLabel')}</Label>
          <Textarea
            id="editNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('tracking.editActivity.notesPlaceholder')}
            rows={3}
          />
        </div>
      </div>
      {/* Action buttons — stacked full-width on mobile, side-by-side on desktop */}
      <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t bg-background">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto h-11 sm:h-10">
          {t('tracking.editActivity.cancelButton')}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-11 sm:h-10">
          {isSubmitting ? t('tracking.editActivity.savingButton') : t('tracking.editActivity.saveButton')}
        </Button>
      </div>
    </form>
  );

  // Mobile: bottom drawer — guaranteed safe-area handling
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <DrawerContent className="max-h-[92vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>{t('tracking.editActivity.title', { activity: getActivityTitle() })}</DrawerTitle>
          </DrawerHeader>
          {formContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: centered dialog
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] flex flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle>{t('tracking.editActivity.title', { activity: getActivityTitle() })}</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};
