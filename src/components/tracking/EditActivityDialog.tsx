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

// Helper: split ISO string into date (YYYY-MM-DD) and time (HH:mm)
const splitDateTime = (iso: string | null): { date: string; time: string } => {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

// Helper: combine date + time into ISO string
const combineDateTime = (date: string, time: string): Date | null => {
  if (!date || !time) return null;
  const combined = new Date(`${date}T${time}:00`);
  return isNaN(combined.getTime()) ? null : combined;
};

export const EditActivityDialog = ({ log, open, onClose, babyId, updateLog }: EditActivityDialogProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      const start = splitDateTime(log.start_time);
      const end = splitDateTime(log.end_time);
      setStartDate(start.date);
      setStartTime(start.time);
      setEndDate(end.date);
      setEndTime(end.time);
      setNotes(log.notes || '');
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const start = combineDateTime(startDate, startTime);
    const end = combineDateTime(endDate, endTime);

    if (!start) {
      setIsSubmitting(false);
      return;
    }

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

  // Shared form content — separate date and time inputs work better on iOS Safari
  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Start date + time */}
        <div className="space-y-2">
          <Label>{t('tracking.editActivity.startTimeLabel')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              aria-label="Start date"
            />
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              aria-label="Start time"
            />
          </div>
        </div>

        {/* End date + time */}
        <div className="space-y-2">
          <Label>{t('tracking.editActivity.endTimeLabel')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
            />
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              aria-label="End time"
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

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }} shouldScaleBackground={false}>
        <DrawerContent className="max-h-[92vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>{t('tracking.editActivity.title', { activity: getActivityTitle() })}</DrawerTitle>
          </DrawerHeader>
          {formContent}
        </DrawerContent>
      </Drawer>
    );
  }

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
