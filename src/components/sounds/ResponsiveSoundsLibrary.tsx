
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
      case 'nature': return <Waves className="h-4 w-4" />;
      case 'ambient': return <Coffee className="h-4 w-4" />;
      case 'lullaby': return <Baby className="h-4 w-4" />;
      case 'sleep': return <BrainCircuit className="h-4 w-4" />;
      case 'white-noise': return <Wind className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
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
        <CardContent className={`p-3 ${isMobile ? 'p-4' : 'p-3'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="text-primary">
                {getCategoryIcon(track.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${isMobile ? 'text-base' : 'text-sm'}`}>
                  {track.name}
                </h4>
                <p className={`text-muted-foreground truncate ${isMobile ? 'text-sm' : 'text-xs'}`}>
                  {track.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {track.category.replace('-', ' ')}
                  </Badge>
                  {track.subcategory && (
                    <Badge variant="outline" className="text-xs">
                      {track.subcategory}
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
                  className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} p-0 ${
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
                className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} p-0`}
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
          
          {/* Mobile-optimized audio controls */}
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
                <div className="flex items-center space-x-1">
                  {getNetworkIcon()}
                  <span className="text-xs text-muted-foreground">
                    {optimalQuality}
                  </span>
                </div>
              </div>

              {/* Progress Bar - Touch-friendly on mobile */}
              {duration > 0 && (
                <div className="mb-4">
                  <div 
                    className={`relative cursor-pointer ${isMobile ? 'py-2' : ''}`}
                    onClick={handleProgressClick}
                  >
                    <Progress 
                      value={getProgressPercentage()} 
                      className={isMobile ? 'h-3' : 'h-2'} 
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Playback Controls - Mobile-optimized */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size={isMobile ? "default" : "sm"}
                    onClick={() => isPlaying ? pauseAudio() : playAudio(currentTrack)}
                    className="bg-primary hover:bg-primary/90"
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
                  
                  <Button size={isMobile ? "default" : "sm"} variant="outline" onClick={stopAudio}>
                    <Square className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size={isMobile ? "default" : "sm"}
                    variant={isLooping ? "default" : "outline"}
                    onClick={toggleLoop}
                    className={isLooping ? 'bg-primary' : ''}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Volume Control - Touch-friendly */}
              <div className="flex items-center space-x-3">
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => changeVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-10">
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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-primary" />
              <span className={isMobile ? 'text-lg' : 'text-xl'}>Calming Sounds</span>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
            {isMobile && <Smartphone className="h-4 w-4 text-muted-foreground" />}
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

          {/* Search Bar - Mobile-optimized */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${isMobile ? 'h-12 text-base' : ''}`}
            />
          </div>

          {/* Tabs for organization */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'h-12' : 'h-auto'}`}>
              <TabsTrigger value="browse" className="flex items-center space-x-2">
                <Music className="h-4 w-4" />
                <span className={isMobile ? 'text-sm' : 'text-xs sm:text-sm'}>Browse</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className={isMobile ? 'text-sm' : 'text-xs sm:text-sm'}>Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className={isMobile ? 'text-sm' : 'text-xs sm:text-sm'}>Recent</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Category Filter - Responsive */}
              <div className={`flex gap-2 mb-4 ${isMobile ? 'flex-wrap' : 'flex-wrap'}`}>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size={isMobile ? "default" : "sm"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>

              {/* Track List - Responsive Grid */}
              <div className="grid gap-3">
                {filteredTracks.map(renderTrackCard)}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favoriteTracks.length > 0 ? (
                <div className="grid gap-3">
                  {favoriteTracks.map(renderTrackCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-8 w-8 mx-auto mb-2" />
                  <p>No favorite sounds yet</p>
                  <p className="text-sm">Heart sounds to add them here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {recentTracks.length > 0 ? (
                <div className="grid gap-3">
                  {recentTracks.map(renderTrackCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No recently played sounds</p>
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
