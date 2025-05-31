
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Clock } from 'lucide-react';

interface AudioTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetTimer: (minutes: number) => void;
  onClearTimer: () => void;
  currentTimer: number | null;
}

export const AudioTimerDialog = ({
  open,
  onOpenChange,
  onSetTimer,
  onClearTimer,
  currentTimer
}: AudioTimerDialogProps) => {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const presetTimes = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '45 minutes', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 }
  ];

  const handleSetTimer = () => {
    if (selectedTime) {
      onSetTimer(selectedTime);
      onOpenChange(false);
      setSelectedTime(null);
    }
  };

  const handleClearTimer = () => {
    onClearTimer();
    onOpenChange(false);
    setSelectedTime(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-purple-600" />
            <span>Set Sleep Timer</span>
          </DialogTitle>
          <DialogDescription>
            Choose how long you want the audio to play before automatically stopping.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentTimer && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Current timer</span>
              </div>
              <Badge variant="secondary">{currentTimer} minutes</Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {presetTimes.map((time) => (
              <Button
                key={time.value}
                variant={selectedTime === time.value ? "default" : "outline"}
                className="h-12 text-sm"
                onClick={() => setSelectedTime(time.value)}
              >
                {time.label}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClearTimer}
            disabled={!currentTimer}
          >
            Clear Timer
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSetTimer}
              disabled={!selectedTime}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Set Timer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
