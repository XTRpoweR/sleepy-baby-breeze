
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

  const getCategoryColors = (category: string, isActive = false, isPlaying = false) => {
    const colorMap = {
      'white-noise': {
        primary: isActive && isPlaying ? 'bg-gray-600' : 'bg-gray-500',
        secondary: isActive && isPlaying ? 'bg-gray-50' : 'bg-gray-50',
        accent: 'text-gray-600',
        ring: 'ring-gray-200',
        badge: 'bg-gray-100 text-gray-800',
        gradient: 'from-gray-50 to-gray-100',
        button: 'bg-gray-600 hover:bg-gray-700'
      },
      'lullaby': {
        primary: isActive && isPlaying ? 'bg-purple-600' : 'bg-purple-500',
        secondary: isActive && isPlaying ? 'bg-purple-50' : 'bg-purple-50',
        accent: 'text-purple-600',
        ring: 'ring-purple-200',
        badge: 'bg-purple-100 text-purple-800',
        gradient: 'from-purple-50 to-purple-100',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      'nature': {
        primary: isActive && isPlaying ? 'bg-green-600' : 'bg-green-500',
        secondary: isActive && isPlaying ? 'bg-green-50' : 'bg-green-50',
        accent: 'text-green-600',
        ring: 'ring-green-200',
        badge: 'bg-green-100 text-green-800',
        gradient: 'from-green-50 to-green-100',
        button: 'bg-green-600 hover:bg-green-700'
      }
    };
    
    return colorMap[category as keyof typeof colorMap] || colorMap['lullaby'];
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
            <Card className={`mb-6 bg-gradient-to-r ${getCategoryColors(currentTrack.category, true, isPlaying).gradient} border-2 ${getCategoryColors(currentTrack.category, true, isPlaying).ring.replace('ring-', 'border-')}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={getCategoryColors(currentTrack.category, true, isPlaying).accent}>
                      {getCategoryIcon(currentTrack.category)}
                    </div>
                    <div>
                      <h3 className="font-medium">{currentTrack.name}</h3>
                      <Badge className={getCategoryColors(currentTrack.category).badge}>
                        {currentTrack.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {timeRemaining && (
                    <div className={`text-sm font-medium ${getCategoryColors(currentTrack.category, true, isPlaying).accent}`}>
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
                      className={getCategoryColors(currentTrack.category).button}
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
                      className={isLooping ? getCategoryColors(currentTrack.category).button : ''}
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
            {filteredTracks.map((track) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              const colors = getCategoryColors(track.category, isCurrentTrack, isPlaying);
              
              return (
                <Card 
                  key={track.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isCurrentTrack ? `ring-2 ${colors.ring} ${colors.secondary}` : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleTrackClick(track)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={colors.accent}>
                          {getCategoryIcon(track.category)}
                        </div>
                        <div>
                          <h4 className="font-medium">{track.name}</h4>
                          <Badge variant="outline" className={`text-xs ${colors.badge}`}>
                            {track.category.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCurrentTrack && isPlaying && !onSoundSelect && (
                          <div className="flex space-x-1">
                            <div className={`w-1 h-4 ${colors.primary} animate-pulse rounded-full`}></div>
                            <div className={`w-1 h-4 ${colors.primary} animate-pulse rounded-full`} style={{ animationDelay: '0.2s' }}></div>
                            <div className={`w-1 h-4 ${colors.primary} animate-pulse rounded-full`} style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        )}
                        <Button size="sm" variant="ghost" disabled={isLoading && isCurrentTrack}>
                          {isLoading && isCurrentTrack ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isCurrentTrack && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
