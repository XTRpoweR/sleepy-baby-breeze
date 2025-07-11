
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  Volume1,
  Repeat, 
  Timer,
  Music,
  Waves,
  Wind,
  Loader2,
  Search,
  Heart,
  Clock,
  Droplets,
  Bird,
  Flame,
  Coffee,
  BrainCircuit,
  Baby,
  Settings,
  SkipForward,
  SkipBack,
  AlertCircle,
  Minus,
  Plus,
  Shuffle,
  Wifi,
  Signal
} from 'lucide-react';
import { useEnhancedAudioPlayer } from '@/hooks/useEnhancedAudioPlayer';
import { AudioQualityControls } from './AudioQualityControls';
import { EnhancedAudioTimerDialog } from './EnhancedAudioTimerDialog';

interface SoundsLibraryProps {
  onSoundSelect?: (sound: any) => void;
}

export const SoundsLibrary = ({ onSoundSelect }: SoundsLibraryProps) => {
  const {
    audioTracks,
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isLooping,
    isLoading,
    error,
    buffering,
    deviceCapabilities,
    currentQuality,
    qualitySettings,
    networkAdaptive,
    crossfadeEnabled,
    preloadEnabled,
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    changeVolume,
    toggleLoop,
    setQualitySettings,
    setNetworkAdaptive,
    setCrossfadeEnabled,
    setPreloadEnabled,
    formatTime,
    initializeAudioContext
  } = useEnhancedAudioPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [showQualityControls, setShowQualityControls] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);

  const categories = [
    { id: 'all', name: 'All Sounds', icon: Music },
    { id: 'nature', name: 'Nature', icon: Waves },
    { id: 'ambient', name: 'Ambient', icon: Coffee },
    { id: 'lullaby', name: 'Lullabies', icon: Baby },
    { id: 'sleep', name: 'Sleep', icon: BrainCircuit },
    { id: 'white-noise', name: 'White Noise', icon: Wind }
  ];

  const getFilteredTracks = () => {
    let filtered = audioTracks.filter(track => 
      searchQuery === '' || 
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(track => track.category === selectedCategory);
    }

    return filtered;
  };

  const filteredTracks = getFilteredTracks();
  const favoriteTracks = audioTracks.filter(track => favorites.includes(track.id));
  const recentTracks = recentlyPlayed
    .map(id => audioTracks.find(track => track.id === id))
    .filter(Boolean) as typeof audioTracks;

  const toggleFavorite = (trackId: string) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId) 
        : [...prev, trackId]
    );
  };

  const addToRecentlyPlayed = (trackId: string) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== trackId);
      return [trackId, ...filtered].slice(0, 10);
    });
  };

  const handleTrackClick = async (track: any) => {
    // Initialize audio context on first user interaction for mobile
    if (deviceCapabilities.isMobile) {
      await initializeAudioContext();
    }

    if (onSoundSelect) {
      onSoundSelect(track);
    } else {
      await playAudio(track);
      addToRecentlyPlayed(track.id);
    }
  };

  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nature': return <Waves className="h-4 w-4" />;
      case 'ambient': return <Coffee className="h-4 w-4" />;
      case 'lullaby': return <Baby className="h-4 w-4" />;
      case 'sleep': return <BrainCircuit className="h-4 w-4" />;
      case 'white-noise': return <Wind className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  const getCategoryColors = (category: string, isActive = false, isPlaying = false) => {
    const colorMap = {
      'nature': {
        primary: isActive && isPlaying ? 'bg-green-600' : 'bg-green-500',
        secondary: 'bg-green-50',
        accent: 'text-green-600',
        ring: 'ring-green-200',
        badge: 'bg-green-100 text-green-800',
        button: 'bg-green-600 hover:bg-green-700'
      },
      'ambient': {
        primary: isActive && isPlaying ? 'bg-amber-600' : 'bg-amber-500',
        secondary: 'bg-amber-50',
        accent: 'text-amber-600',
        ring: 'ring-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        button: 'bg-amber-600 hover:bg-amber-700'
      },
      'lullaby': {
        primary: isActive && isPlaying ? 'bg-purple-600' : 'bg-purple-500',
        secondary: 'bg-purple-50',
        accent: 'text-purple-600',
        ring: 'ring-purple-200',
        badge: 'bg-purple-100 text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      'sleep': {
        primary: isActive && isPlaying ? 'bg-indigo-600' : 'bg-indigo-500',
        secondary: 'bg-indigo-50',
        accent: 'text-indigo-600',
        ring: 'ring-indigo-200',
        badge: 'bg-indigo-100 text-indigo-800',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      },
      'white-noise': {
        primary: isActive && isPlaying ? 'bg-gray-600' : 'bg-gray-500',
        secondary: 'bg-gray-50',
        accent: 'text-gray-600',
        ring: 'ring-gray-200',
        badge: 'bg-gray-100 text-gray-800',
        button: 'bg-gray-600 hover:bg-gray-700'
      }
    };
    
    return colorMap[category as keyof typeof colorMap] || colorMap['nature'];
  };

  const renderTrackCard = (track: any) => {
    const isCurrentTrack = currentTrack?.id === track.id;
    const colors = getCategoryColors(track.category, isCurrentTrack, isPlaying);
    const isFavorite = favorites.includes(track.id);
    
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
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={colors.accent}>
                {getCategoryIcon(track.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{track.name}</h4>
                <p className="text-xs text-gray-500 truncate">{track.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${colors.badge}`}>
                    {track.category.replace('-', ' ')}
                  </Badge>
                  {isCurrentTrack && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                      {currentQuality.toUpperCase()}
                    </Badge>
                  )}
                  {buffering && isCurrentTrack && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 animate-pulse">
                      Buffering
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              {!onSoundSelect && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className={`p-1 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              )}
              {isCurrentTrack && isPlaying && !onSoundSelect && (
                <div className="flex space-x-1">
                  <div className={`w-1 h-4 ${colors.primary} animate-pulse rounded-full`}></div>
                  <div className={`w-1 h-4 ${colors.primary} animate-pulse rounded-full`} style={{ animationDelay: '0.2s' }}></div>
                  <div className={`w-1 h-4 ${colors.primary} animate-pulse rounded-full`} style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
              <Button size="sm" variant="ghost" disabled={isLoading && isCurrentTrack} className="p-1">
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
          
          {/* Enhanced Audio Controls */}
          {isCurrentTrack && currentTrack && !onSoundSelect && (
            <div className={`mt-4 p-4 rounded-lg ${colors.secondary} border-2 ${colors.ring.replace('ring-', 'border-')}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge className={colors.badge}>
                    {currentTrack.category.replace('-', ' ')}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {currentQuality.toUpperCase()}
                  </Badge>
                  {networkAdaptive && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Auto
                    </Badge>
                  )}
                  {deviceCapabilities.isMobile && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      Mobile
                    </Badge>
                  )}
                </div>
                {buffering && (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Signal className="h-3 w-3 animate-pulse" />
                    <span className="text-xs">Buffering</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {duration > 0 && (
                <div className="mb-4">
                  <div 
                    className="relative cursor-pointer"
                    onClick={handleProgressClick}
                  >
                    <Progress 
                      value={getProgressPercentage()} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Enhanced Playback Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => seekTo(Math.max(currentTime - 15, 0))}
                    disabled={!isPlaying}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => isPlaying ? pauseAudio() : playAudio(currentTrack)}
                    className={colors.button}
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
                    variant="outline"
                    onClick={() => seekTo(Math.min(currentTime + 15, duration))}
                    disabled={!isPlaying}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isLooping ? "default" : "outline"}
                    onClick={toggleLoop}
                    className={isLooping ? colors.button : ''}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowQualityControls(!showQualityControls)}
                  >
                    <Settings className="h-4 w-4" />
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
                <Button size="sm" variant="ghost" onClick={() => changeVolume(Math.max(volume - 0.1, 0))}>
                  <Minus className="h-4 w-4" />
                </Button>
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-gray-600" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4 text-gray-600" />
                ) : (
                  <Volume2 className="h-4 w-4 text-gray-600" />
                )}
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => changeVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Button size="sm" variant="ghost" onClick={() => changeVolume(Math.min(volume + 0.1, 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 w-10">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Audio Quality Controls */}
      {showQualityControls && (
        <AudioQualityControls
          deviceCapabilities={deviceCapabilities}
          qualitySettings={qualitySettings}
          currentQuality={currentQuality}
          networkAdaptive={networkAdaptive}
          crossfadeEnabled={crossfadeEnabled}
          preloadEnabled={preloadEnabled}
          buffering={buffering}
          onQualitySettingsChange={setQualitySettings}
          onNetworkAdaptiveChange={setNetworkAdaptive}
          onCrossfadeChange={setCrossfadeEnabled}
          onPreloadChange={setPreloadEnabled}
        />
      )}

      {/* Tabs for Browse, Favorites, Recently Played */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent ({recentTracks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4">
            {filteredTracks.map(renderTrackCard)}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <div className="grid gap-4">
            {favoriteTracks.length > 0 ? (
              favoriteTracks.map(renderTrackCard)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No favorite sounds yet. Tap the heart icon to add favorites!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {recentTracks.length > 0 ? (
              recentTracks.map(renderTrackCard)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recently played sounds. Start playing some sounds to see them here!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Audio Timer Dialog */}
      {!onSoundSelect && (
        <EnhancedAudioTimerDialog
          open={showTimerDialog}
          onOpenChange={setShowTimerDialog}
          onSetTimer={() => {}}
          onSetCustomTimer={() => {}}
          onClearTimer={() => {}}
          currentTimer={null}
          timeRemaining={null}
          formatTime={formatTime}
        />
      )}
    </div>
  );
};
