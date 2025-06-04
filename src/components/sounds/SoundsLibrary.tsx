
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Repeat, 
  Timer,
  Music,
  Waves,
  Wind,
  Loader2
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AudioTimerDialog } from './AudioTimerDialog';

interface SoundsLibraryProps {
  onSoundSelect?: (sound: any) => void;
}

export const SoundsLibrary = ({ onSoundSelect }: SoundsLibraryProps) => {
  const {
    audioTracks,
    isPlaying,
    currentTrack,
    volume,
    isLooping,
    timer,
    timeRemaining,
    isLoading,
    playAudio,
    pauseAudio,
    stopAudio,
    setVolume,
    setIsLooping,
    setAudioTimer,
    clearTimer
  } = useAudioPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTimerDialog, setShowTimerDialog] = useState(false);

  const categories = [
    { id: 'all', name: 'All Sounds', icon: Music },
    { id: 'white-noise', name: 'White Noise', icon: Wind },
    { id: 'lullaby', name: 'Lullabies', icon: Music },
    { id: 'nature', name: 'Nature', icon: Waves }
  ];

  const filteredTracks = selectedCategory === 'all' 
    ? audioTracks 
    : audioTracks.filter(track => track.category === selectedCategory);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'white-noise':
        return <Wind className="h-4 w-4" />;
      case 'lullaby':
        return <Music className="h-4 w-4" />;
      case 'nature':
        return <Waves className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

  const handleTrackClick = async (track: any) => {
    if (onSoundSelect) {
      onSoundSelect(track);
    } else {
      if (currentTrack?.id === track.id && isPlaying) {
        pauseAudio();
      } else {
        await playAudio(track);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-purple-600" />
            <span>Sounds & Audio</span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </Button>
            ))}
          </div>

          {/* Current Playing Track */}
          {currentTrack && !onSoundSelect && (
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(currentTrack.category)}
                    <div>
                      <h3 className="font-medium">{currentTrack.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {currentTrack.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {timeRemaining && (
                    <div className="text-sm text-purple-600 font-medium">
                      Timer: {formatTime(timeRemaining)}
                    </div>
                  )}
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => isPlaying ? pauseAudio() : playAudio(currentTrack)}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline" onClick={stopAudio}>
                      <Square className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={isLooping ? "default" : "outline"}
                      onClick={() => setIsLooping(!isLooping)}
                    >
                      <Repeat className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowTimerDialog(true)}
                    >
                      <Timer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-4 w-4 text-gray-600" />
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(value) => setVolume(value[0] / 100)}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-10">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Track List */}
          <div className="grid gap-3">
            {filteredTracks.map((track) => (
              <Card 
                key={track.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentTrack?.id === track.id ? 'ring-2 ring-purple-200 bg-purple-50' : ''
                }`}
                onClick={() => handleTrackClick(track)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(track.category)}
                      <div>
                        <h4 className="font-medium">{track.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {track.category.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {currentTrack?.id === track.id && isPlaying && !onSoundSelect && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-4 bg-purple-600 animate-pulse rounded-full"></div>
                          <div className="w-1 h-4 bg-purple-600 animate-pulse rounded-full" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-4 bg-purple-600 animate-pulse rounded-full" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      )}
                      <Button size="sm" variant="ghost" disabled={isLoading && currentTrack?.id === track.id}>
                        {isLoading && currentTrack?.id === track.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {!onSoundSelect && (
        <AudioTimerDialog
          open={showTimerDialog}
          onOpenChange={setShowTimerDialog}
          onSetTimer={setAudioTimer}
          onClearTimer={clearTimer}
          currentTimer={timer}
        />
      )}
    </div>
  );
};
