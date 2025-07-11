
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
  AlertCircle,
  Wifi,
  WifiOff,
  Smartphone
} from 'lucide-react';
import { useMobileAudioPlayer } from '@/hooks/useMobileAudioPlayer';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveSoundsLibraryProps {
  onSoundSelect?: (sound: any) => void;
}

export const ResponsiveSoundsLibrary = ({ onSoundSelect }: ResponsiveSoundsLibraryProps) => {
  const {
    audioTracks,
    favoriteTracks,
    recentTracks,
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isLooping,
    isLoading,
    isBuffering,
    error,
    audioQuality,
    networkType,
    optimalQuality,
    searchQuery,
    favorites,
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    changeVolume,
    toggleLoop,
    setAudioQuality,
    setSearchQuery,
    toggleFavorite,
    formatTime
  } = useMobileAudioPlayer();

  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('browse');

  const categories = [
    { id: 'all', name: 'All', icon: Music },
    { id: 'nature', name: 'Nature', icon: Waves },
    { id: 'ambient', name: 'Ambient', icon: Coffee },
    { id: 'lullaby', name: 'Lullabies', icon: Baby },
    { id: 'sleep', name: 'Sleep', icon: BrainCircuit },
    { id: 'white-noise', name: 'White Noise', icon: Wind }
  ];

  const getFilteredTracks = () => {
    let filtered = audioTracks;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(track => track.category === selectedCategory);
    }
    return filtered;
  };

  const filteredTracks = getFilteredTracks();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nature': return <Waves className="h-5 w-5" />;
      case 'ambient': return <Coffee className="h-5 w-5" />;
      case 'lullaby': return <Baby className="h-5 w-5" />;
      case 'sleep': return <BrainCircuit className="h-5 w-5" />;
      case 'white-noise': return <Wind className="h-5 w-5" />;
      default: return <Music className="h-5 w-5" />;
    }
  };

  const getCategoryColors = (category: string, isActive = false) => {
    const colorMap = {
      'nature': 'bg-green-500 text-white',
      'ambient': 'bg-amber-500 text-white',
      'lullaby': 'bg-purple-500 text-white',
      'sleep': 'bg-indigo-500 text-white',
      'white-noise': 'bg-gray-500 text-white'
    };
    return isActive ? (colorMap[category as keyof typeof colorMap] || 'bg-blue-500 text-white') : '';
  };

  const handleTrackClick = async (track: any) => {
    if (onSoundSelect) {
      onSoundSelect(track);
    } else {
      await playAudio(track);
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

  const getNetworkIcon = () => {
    if (networkType === 'slow-2g' || networkType === '2g') {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const renderTrackCard = (track: any) => {
    const isCurrentTrack = currentTrack?.id === track.id;
    const isFavorite = favorites.includes(track.id);
    
    return (
      <Card 
        key={track.id} 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isCurrentTrack ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
        }`}
        onClick={() => handleTrackClick(track)}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="text-primary flex-shrink-0">
                {getCategoryIcon(track.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-base leading-tight truncate mb-1">
                  {track.name}
                </h4>
                <p className="text-muted-foreground text-sm leading-tight truncate mb-2">
                  {track.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {track.category.replace('-', ' ')}
                  </Badge>
                  {track.subcategory && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {track.subcategory}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
              {!onSoundSelect && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className={`h-9 w-9 p-0 ${
                    isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="ghost" 
                disabled={isLoading && isCurrentTrack}
                className="h-9 w-9 p-0"
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
          
          {/* Enhanced audio controls with proper proportions */}
          {isCurrentTrack && currentTrack && !onSoundSelect && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColors(currentTrack.category, true)}>
                    {currentTrack.category.replace('-', ' ')}
                  </Badge>
                  {isBuffering && (
                    <Badge variant="outline" className="animate-pulse">
                      Buffering...
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {getNetworkIcon()}
                  <span className="text-xs text-muted-foreground">
                    {optimalQuality}
                  </span>
                </div>
              </div>

              {/* Progress Bar - Properly proportioned */}
              {duration > 0 && (
                <div className="mb-4">
                  <div 
                    className="relative cursor-pointer py-2"
                    onClick={handleProgressClick}
                  >
                    <Progress 
                      value={getProgressPercentage()} 
                      className="h-2" 
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Playback Controls - Consistently sized */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size="default"
                    onClick={() => isPlaying ? pauseAudio() : playAudio(currentTrack)}
                    className="bg-primary hover:bg-primary/90 h-10 px-4"
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
                  
                  <Button size="default" variant="outline" onClick={stopAudio} className="h-10 px-4">
                    <Square className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="default"
                    variant={isLooping ? "default" : "outline"}
                    onClick={toggleLoop}
                    className={`h-10 px-4 ${isLooping ? 'bg-primary' : ''}`}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Volume Control - Properly proportioned */}
              <div className="flex items-center space-x-3">
                {volume === 0 ? (
                  <VolumeX className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Volume2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => changeVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right flex-shrink-0">
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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Calming Sounds</span>
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            {isMobile && <Smartphone className="h-5 w-5 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Search Bar - Properly sized */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Tabs for organization */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 h-11">
              <TabsTrigger value="browse" className="flex items-center space-x-2">
                <Music className="h-4 w-4" />
                <span>Browse</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Recent</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Category Filter - Consistently sized buttons */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="default"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2 h-10 px-4"
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>

              {/* Track List */}
              <div className="grid gap-4">
                {filteredTracks.map(renderTrackCard)}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favoriteTracks.length > 0 ? (
                <div className="grid gap-4">
                  {favoriteTracks.map(renderTrackCard)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No favorite sounds yet</h3>
                  <p className="text-sm">Heart sounds to add them here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {recentTracks.length > 0 ? (
                <div className="grid gap-4">
                  {recentTracks.map(renderTrackCard)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recently played sounds</h3>
                  <p className="text-sm">Play a sound to see it here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
