import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
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

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

// Reusable DateTime picker using Calendar + Hour/Minute selects
interface DateTimePickerProps {
  value: Date | null;
  onChange: (d: Date | null) => void;
  label: string;
  required?: boolean;
}

const DateTimePicker = ({ value, onChange, label, required }: DateTimePickerProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const current = value || new Date();
    const next = new Date(date);
    next.setHours(current.getHours(), current.getMinutes(), 0, 0);
    onChange(next);
    setCalendarOpen(false);
  };

  const handleHourChange = (h: number) => {
    const base = value || new Date();
    const next = new Date(base);
    next.setHours(h);
    onChange(next);
  };

  const handleMinuteChange = (m: number) => {
    const base = value || new Date();
    const next = new Date(base);
    next.setMinutes(m);
    onChange(next);
  };

  const currentHour = value ? value.getHours() : 0;
  const currentMinute = value ? value.getMinutes() : 0;
  // Snap current minute to nearest 5
  const snappedMinute = Math.round(currentMinute / 5) * 5 % 60;

  return (
    <div className="space-y-2">
      <Label>{label}{required && ' *'}</Label>
      <div className="grid grid-cols-2 gap-2">
        {/* Date picker button */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'h-11 w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {value ? format(value, 'MMM d, yyyy') : 'Pick a date'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Time picker (two selects) */}
        <div className="flex items-center gap-1 h-11 px-2 border rounded-md bg-background">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={currentHour}
            onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
            className="bg-transparent outline-none cursor-pointer flex-1 text-center"
            aria-label="Hour"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <span>:</span>
          <select
            value={snappedMinute}
            onChange={(e) => handleMinuteChange(parseInt(e.target.value, 10))}
            className="bg-transparent outline-none cursor-pointer flex-1 text-center"
            aria-label="Minute"
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export const EditActivityDialog = ({ log, open, onClose, babyId, updateLog }: EditActivityDialogProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      setStartTime(log.start_time ? new Date(log.start_time) : null);
      setEndTime(log.end_time ? new Date(log.end_time) : null);
      setNotes(log.notes || '');
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime) return;
    setIsSubmitting(true);
    const duration = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) : null;
    const updates = {
      start_time: startTime.toISOString(),
      end_time: endTime?.toISOString() || null,
      duration_minutes: duration,
      notes: notes.trim() || null,
    };
    const success = await updateLog(log.id, updates);
    if (success) onClose();
    setIsSubmitting(false);
  };

  const getActivityTitle = () => {
    if (log?.activity_type === 'custom') {
      return log?.metadata?.activity_name || t('activities.custom');
    }
    return t(`activities.${log?.activity_type}`);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <DateTimePicker
          value={startTime}
          onChange={setStartTime}
          label={t('tracking.editActivity.startTimeLabel')}
          required
        />
        <DateTimePicker
          value={endTime}
          onChange={setEndTime}
          label={t('tracking.editActivity.endTimeLabel')}
        />
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
        <Button type="submit" disabled={isSubmitting || !startTime} className="w-full sm:w-auto h-11 sm:h-10">
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
