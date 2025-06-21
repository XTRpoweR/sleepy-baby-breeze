
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer, Clock, Zap } from 'lucide-react';

interface EnhancedAudioTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetTimer: (minutes: number) => void;
  onSetCustomTimer: (hours: number, minutes: number, seconds: number) => void;
  onClearTimer: () => void;
  currentTimer: number | null;
  timeRemaining: number | null;
  formatTime: (seconds: number) => string;
}

export const EnhancedAudioTimerDialog = ({
  open,
  onOpenChange,
  onSetTimer,
  onSetCustomTimer,
  onClearTimer,
  currentTimer,
  timeRemaining,
  formatTime
}: EnhancedAudioTimerDialogProps) => {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);
  const { t } = useTranslation();

  const presetTimes = [
    { label: `5 ${t('components.sounds.minutes')}`, value: 5 },
    { label: `10 ${t('components.sounds.minutes')}`, value: 10 },
    { label: `15 ${t('components.sounds.minutes')}`, value: 15 },
    { label: `30 ${t('components.sounds.minutes')}`, value: 30 },
    { label: `45 ${t('components.sounds.minutes')}`, value: 45 },
    { label: `1 ${t('components.sounds.hour')}`, value: 60 },
    { label: `1.5 ${t('components.sounds.hours')}`, value: 90 },
    { label: `2 ${t('components.sounds.hours')}`, value: 120 },
    { label: `3 ${t('components.sounds.hours')}`, value: 180 },
    { label: `4 ${t('components.sounds.hours')}`, value: 240 }
  ];

  const quickPresets = [
    { label: '5m', value: 5 },
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '1h', value: 60 },
    { label: '2h', value: 120 },
    { label: '8h', value: 480 }
  ];

  const handleSetTimer = () => {
    if (selectedTime) {
      onSetTimer(selectedTime);
      onOpenChange(false);
      setSelectedTime(null);
    }
  };

  const handleSetCustomTimer = () => {
    if (customHours > 0 || customMinutes > 0 || customSeconds > 0) {
      onSetCustomTimer(customHours, customMinutes, customSeconds);
      onOpenChange(false);
      setCustomHours(0);
      setCustomMinutes(0);
      setCustomSeconds(0);
    }
  };

  const handleClearTimer = () => {
    onClearTimer();
    onOpenChange(false);
    setSelectedTime(null);
  };

  const getTotalCustomSeconds = () => customHours * 3600 + customMinutes * 60 + customSeconds;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-purple-600" />
            <span>Sleep Timer</span>
          </DialogTitle>
          <DialogDescription>
            Set a timer to automatically stop the audio after a specific duration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Timer Status */}
          {(currentTimer || timeRemaining) && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Current Timer</span>
              </div>
              <div className="flex flex-col items-end">
                {currentTimer && (
                  <Badge variant="secondary">{currentTimer} minutes</Badge>
                )}
                {timeRemaining && (
                  <Badge className="mt-1 bg-purple-600 text-white">
                    {formatTime(timeRemaining)} remaining
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Tabs defaultValue="presets" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="quick">Quick</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-3">
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
            </TabsContent>

            <TabsContent value="quick" className="space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Quick Set</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {quickPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={selectedTime === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-xs">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    max="23"
                    value={customHours}
                    onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes" className="text-xs">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seconds" className="text-xs">Seconds</Label>
                  <Input
                    id="seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-center"
                  />
                </div>
              </div>
              {getTotalCustomSeconds() > 0 && (
                <div className="text-center text-sm text-gray-600">
                  Total: {formatTime(getTotalCustomSeconds())}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClearTimer}
            disabled={!currentTimer && !timeRemaining}
          >
            Clear Timer
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={selectedTime ? handleSetTimer : handleSetCustomTimer}
              disabled={!selectedTime && getTotalCustomSeconds() === 0}
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
