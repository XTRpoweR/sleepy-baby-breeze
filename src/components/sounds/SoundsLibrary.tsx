
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

  // Dynamic color themes based on category and state
  const getCategoryColors = (category: string, isActive: boolean = false, isCurrentlyPlaying: boolean = false) => {
    const baseColors = {
      'white-noise': {
        primary: 'from-gray-100 to-slate-200',
        accent: 'bg-gray-600 hover:bg-gray-700',
        border: 'border-gray-300',
        text: 'text-gray-700',
        icon: 'text-gray-600'
      },
      'lullaby': {
        primary: 'from-pink-100 to-rose-200',
        accent: 'bg-pink-600 hover:bg-pink-700',
        border: 'border-pink-300',
        text: 'text-pink-700',
        icon: 'text-pink-600'
      },
      'nature': {
        primary: 'from-green-100 to-emerald-200',
        accent: 'bg-green-600 hover:bg-green-700',
        border: 'border-green-300',
        text: 'text-green-700',
        icon: 'text-green-600'
      },
      'all': {
        primary: 'from-purple-100 to-blue-200',
        accent: 'bg-purple-600 hover:bg-purple-700',
        border: 'border-purple-300',
        text: 'text-purple-700',
        icon: 'text-purple-600'
      }
    };

    const colors = baseColors[category as keyof typeof baseColors] || baseColors.all;

    if (isCurrentlyPlaying) {
      return {
        ...colors,
        primary: colors.primary.replace('100', '200').replace('200', '300'),
        accent: colors.accent.replace('600', '500').replace('700', '600'),
        glow: 'shadow-lg shadow-current/20'
      };
    }

    if (isActive) {
      return {
        ...colors,
        primary: colors.primary.replace('100', '150').replace('200', '250'),
        glow: 'shadow-md shadow-current/10'
      };
    }

    return colors;
  };

  // Get dynamic colors for the main container
  const getMainContainerColors = () => {
    if (currentTrack && isPlaying) {
      return getCategoryColors(currentTrack.category, false, true);
    }
    return getCategoryColors('all');
  };

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
    const colors = getCategoryColors(category);
    const iconClass = `h-4 w-4 ${colors.icon}`;
    
    switch (category) {
      case 'white-noise':
        return <Wind className={iconClass} />;
      case 'lullaby':
        return <Music className={iconClass} />;
      case 'nature':
        return <Waves className={iconClass} />;
      default:
        return <Music className={iconClass} />;
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

  const mainColors = getMainContainerColors();

  return (
    <div className="space-y-6">
      <Card className={`transition-all duration-500 ${mainColors.glow || ''}`}>
        <CardHeader className={`bg-gradient-to-r ${mainColors.primary} transition-all duration-500`}>
          <CardTitle className={`flex items-center space-x-2 ${mainColors.text}`}>
            <Music className={`h-5 w-5 ${mainColors.icon} ${isPlaying ? 'animate-pulse' : ''}`} />
            <span>Sounds & Audio</span>
            {isLoading && <Loader2 className={`h-4 w-4 animate-spin ${mainColors.icon}`} />}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              const categoryColors = getCategoryColors(category.id, isSelected);
              
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 transition-all duration-300 ${
                    isSelected 
                      ? `${categoryColors.accent} text-white` 
                      : `hover:bg-gradient-to-r hover:${categoryColors.primary} ${categoryColors.border} ${categoryColors.text}`
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Current Playing Track */}
          {currentTrack && !onSoundSelect && (
            <Card className={`mb-6 bg-gradient-to-r ${getCategoryColors(currentTrack.category, false, isPlaying).primary} ${getCategoryColors(currentTrack.category, false, isPlaying).border} transition-all duration-500 ${isPlaying ? 'animate-pulse' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(currentTrack.category)}
                    <div>
                      <h3 className={`font-medium ${getCategoryColors(currentTrack.category).text}`}>{currentTrack.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {currentTrack.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {timeRemaining && (
                    <div className={`text-sm font-medium ${getCategoryColors(currentTrack.category).text}`}>
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
                      className={`${getCategoryColors(currentTrack.category).accent} transition-all duration-300`}
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
                      className={isLooping ? getCategoryColors(currentTrack.category).accent : ''}
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
                  <Volume2 className={`h-4 w-4 ${getCategoryColors(currentTrack.category).icon}`} />
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(value) => setVolume(value[0] / 100)}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className={`text-sm w-10 ${getCategoryColors(currentTrack.category).text}`}>
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
              const trackColors = getCategoryColors(track.category, isCurrentTrack, isCurrentTrack && isPlaying);
              
              return (
                <Card 
                  key={track.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                    isCurrentTrack 
                      ? `ring-2 ${trackColors.border.replace('border-', 'ring-')} bg-gradient-to-r ${trackColors.primary} ${trackColors.glow || ''}` 
                      : `hover:bg-gradient-to-r hover:${getCategoryColors(track.category, true).primary}`
                  }`}
                  onClick={() => handleTrackClick(track)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(track.category)}
                        <div>
                          <h4 className={`font-medium ${trackColors.text}`}>{track.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {track.category.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCurrentTrack && isPlaying && !onSoundSelect && (
                          <div className="flex space-x-1">
                            <div className={`w-1 h-4 ${trackColors.accent.split(' ')[0].replace('bg-', 'bg-')} animate-pulse rounded-full`}></div>
                            <div className={`w-1 h-4 ${trackColors.accent.split(' ')[0].replace('bg-', 'bg-')} animate-pulse rounded-full`} style={{ animationDelay: '0.2s' }}></div>
                            <div className={`w-1 h-4 ${trackColors.accent.split(' ')[0].replace('bg-', 'bg-')} animate-pulse rounded-full`} style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          disabled={isLoading && isCurrentTrack}
                          className={`${trackColors.text} hover:${trackColors.accent.split(' ')[1]} transition-all duration-300`}
                        >
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
