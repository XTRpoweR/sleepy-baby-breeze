
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Volume2, Zap, Waves, Clock } from 'lucide-react';

interface AudioSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volume: number;
  playbackRate: number;
  fadeIn: boolean;
  fadeOut: boolean;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onFadeInChange: (enabled: boolean) => void;
  onFadeOutChange: (enabled: boolean) => void;
}

export const AudioSettingsDialog = ({
  open,
  onOpenChange,
  volume,
  playbackRate,
  fadeIn,
  fadeOut,
  onVolumeChange,
  onPlaybackRateChange,
  onFadeInChange,
  onFadeOutChange
}: AudioSettingsDialogProps) => {
  const playbackRates = [
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: '1x', value: 1 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '2x', value: 2 }
  ];

  const volumePresets = [
    { label: 'Whisper', value: 0.1 },
    { label: 'Quiet', value: 0.3 },
    { label: 'Medium', value: 0.5 },
    { label: 'Loud', value: 0.7 },
    { label: 'Max', value: 1.0 }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Audio Settings</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="playback" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="playback" className="flex items-center space-x-1">
              <Volume2 className="h-3 w-3" />
              <span className="text-xs">Playback</span>
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center space-x-1">
              <Waves className="h-3 w-3" />
              <span className="text-xs">Effects</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span className="text-xs">Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="playback" className="space-y-6">
            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Volume</Label>
                <Badge variant="outline">{Math.round(volume * 100)}%</Badge>
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={(value) => onVolumeChange(value[0] / 100)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex flex-wrap gap-2">
                {volumePresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={Math.abs(volume - preset.value) < 0.05 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onVolumeChange(preset.value)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Playback Speed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Playback Speed</Label>
                <Badge variant="outline">{playbackRate}x</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {playbackRates.map((rate) => (
                  <Button
                    key={rate.value}
                    variant={playbackRate === rate.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPlaybackRateChange(rate.value)}
                  >
                    {rate.label}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-6">
            {/* Fade Effects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Fade In</Label>
                  <p className="text-xs text-gray-500">Gradually increase volume when starting</p>
                </div>
                <Switch
                  checked={fadeIn}
                  onCheckedChange={onFadeInChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Fade Out</Label>
                  <p className="text-xs text-gray-500">Gradually decrease volume when stopping</p>
                </div>
                <Switch
                  checked={fadeOut}
                  onCheckedChange={onFadeOutChange}
                />
              </div>
            </div>

            {/* Audio Enhancement Info */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Waves className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Audio Enhancement</span>
              </div>
              <p className="text-xs text-gray-600">
                Fade effects create smooth transitions for a more pleasant listening experience, 
                especially helpful for sleep and relaxation.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Reset to Defaults */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Reset Settings</Label>
              <Button
                variant="outline"
                onClick={() => {
                  onVolumeChange(0.7);
                  onPlaybackRateChange(1);
                  onFadeInChange(false);
                  onFadeOutChange(false);
                }}
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>

            {/* Current Settings Summary */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Current Settings</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Volume: {Math.round(volume * 100)}%</div>
                <div>Speed: {playbackRate}x</div>
                <div>Fade In: {fadeIn ? 'Enabled' : 'Disabled'}</div>
                <div>Fade Out: {fadeOut ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
