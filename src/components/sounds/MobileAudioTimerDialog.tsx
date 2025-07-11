
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Timer, 
  Clock, 
  Pause, 
  Play, 
  X,
  Moon,
  Coffee,
  Sunrise,
  Star
} from 'lucide-react';

interface MobileAudioTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetTimer: (minutes: number) => void;
  onSetCustomTimer: (hours: number, minutes: number, seconds: number) => void;
  onClearTimer: () => void;
  currentTimer: number | null;
  timeRemaining: number | null;
  formatTime: (seconds: number) => string;
  isPlaying: boolean;
}

export const MobileAudioTimerDialog = ({
  open,
  onOpenChange,
  onSetTimer,
  onSetCustomTimer,
  onClearTimer,
  currentTimer,
  timeRemaining,
  formatTime,
  isPlaying
}: MobileAudioTimerDialogProps) => {
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [customSeconds, setCustomSeconds] = useState(0);

  const presetTimers = [
    { label: '15 min', minutes: 15, icon: Coffee, description: 'Quick nap' },
    { label: '30 min', minutes: 30, icon: Moon, description: 'Short rest' },
    { label: '45 min', minutes: 45, icon: Star, description: 'Power nap' },
    { label: '1 hour', minutes: 60, icon: Sunrise, description: 'Long rest' },
    { label: '2 hours', minutes: 120, icon: Moon, description: 'Deep sleep' }
  ];

  const handleSetCustomTimer = () => {
    onSetCustomTimer(customHours, customMinutes, customSeconds);
  };

  const getTimerProgress = () => {
    if (!currentTimer || !timeRemaining) return 0;
    const totalSeconds = currentTimer * 60;
    const elapsed = totalSeconds - timeRemaining;
    return (elapsed / totalSeconds) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-blue-600" />
            <span>Sleep Timer</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Timer Display */}
          {timeRemaining && (
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
              <div className="mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-gray-600">remaining</p>
              </div>
              
              <Progress 
                value={getTimerProgress()} 
                className="h-2 mb-4" 
              />
              
              <div className="flex items-center justify-center space-x-2">
                {isPlaying ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Play className="h-3 w-3 mr-1" />
                    Playing
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Pause className="h-3 w-3 mr-1" />
                    Paused
                  </Badge>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearTimer}
                className="mt-3"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Timer
              </Button>
            </div>
          )}

          {/* Preset Timers */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-600" />
              Quick Timer
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {presetTimers.map((preset) => (
                <Button
                  key={preset.minutes}
                  variant="outline"
                  onClick={() => onSetTimer(preset.minutes)}
                  className="flex flex-col items-center p-4 h-auto hover:bg-blue-50 hover:border-blue-200"
                >
                  <preset.icon className="h-5 w-5 mb-2 text-blue-600" />
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-xs text-gray-500 text-center">
                    {preset.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Timer */}
          <div>
            <h4 className="font-medium mb-3">Custom Timer</h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="hours" className="text-sm text-gray-600">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="12"
                  value={customHours}
                  onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-center"
                />
              </div>
              <div>
                <Label htmlFor="minutes" className="text-sm text-gray-600">Minutes</Label>
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
              <div>
                <Label htmlFor="seconds" className="text-sm text-gray-600">Seconds</Label>
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
            
            <Button 
              onClick={handleSetCustomTimer} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={customHours === 0 && customMinutes === 0 && customSeconds === 0}
            >
              <Timer className="h-4 w-4 mr-2" />
              Set Custom Timer
            </Button>
          </div>

          {/* Timer Info */}
          <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
            <p className="mb-1">🎵 Music will automatically stop when the timer reaches zero</p>
            <p>📱 Timer continues running even when the app is in background</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
