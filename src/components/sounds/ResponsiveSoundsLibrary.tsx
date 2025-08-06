import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Square, Volume2, VolumeX, Volume1, Repeat, Music, Waves, Wind, Loader2, Search, Heart, Clock, Coffee, BrainCircuit, Baby, AlertCircle, Wifi, WifiOff, Smartphone, Timer, SkipForward, SkipBack, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMobileAudioPlayer } from '@/hooks/useMobileAudioPlayer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAudioTimerDialog } from './MobileAudioTimerDialog';
interface ResponsiveSoundsLibraryProps {
  onSoundSelect?: (sound: any) => void;
}
export const ResponsiveSoundsLibrary = ({
  onSoundSelect
}: ResponsiveSoundsLibraryProps) => {
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
    timer,
    timeRemaining,
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    changeVolume,
    toggleLoop,
    skipForward,
    skipBackward,
    playNextTrack,
    playPreviousTrack,
    setAudioQuality,
    setSearchQuery,
    toggleFavorite,
    formatTime,
    setAudioTimer,
    setAudioCustomTimer,
    clearTimer
  } = useMobileAudioPlayer();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const categories = [{
    id: 'all',
    name: 'All',
    icon: Music
  }, {
    id: 'nature',
    name: 'Nature',
    icon: Waves
  }, {
    id: 'ambient',
    name: 'Ambient',
    icon: Coffee
  }, {
    id: 'lullaby',
    name: 'Lullabies',
    icon: Baby
  }, {
    id: 'sleep',
    name: 'Sleep',
    icon: BrainCircuit
  }, {
    id: 'white-noise',
    name: 'White Noise',
    icon: Wind
  }];
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
      case 'nature':
        return <Waves className="h-4 w-4" />;
      case 'ambient':
        return <Coffee className="h-4 w-4" />;
      case 'lullaby':
        return <Baby className="h-4 w-4" />;
      case 'sleep':
        return <BrainCircuit className="h-4 w-4" />;
      case 'white-noise':
        return <Wind className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
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
    return isActive ? colorMap[category as keyof typeof colorMap] || 'bg-blue-500 text-white' : '';
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
    return currentTime / duration * 100;
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
    return <div key={track.id} className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${isCurrentTrack ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`} onClick={() => handleTrackClick(track)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="text-primary flex-shrink-0">
              {getCategoryIcon(track.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight truncate mb-1">
                {track.name}
              </h4>
              <p className="text-muted-foreground text-xs leading-tight truncate mb-2">
                {track.description}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {track.category.replace('-', ' ')}
                </Badge>
                {track.subcategory && <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {track.subcategory}
                  </Badge>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
            {!onSoundSelect && <Button size="sm" variant="ghost" onClick={e => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }} className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}>
                <Heart className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>}
            
            <Button size="sm" variant="ghost" disabled={isLoading && isCurrentTrack} className="h-8 w-8 p-0">
              {isLoading && isCurrentTrack ? <Loader2 className="h-3 w-3 animate-spin" /> : isCurrentTrack && isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {/* Enhanced Audio Controls */}
        {isCurrentTrack && currentTrack && !onSoundSelect && <div className="mt-3 p-3 rounded-md bg-muted/50 border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryColors(currentTrack.category, true)} variant="default">
                  {currentTrack.category.replace('-', ' ')}
                </Badge>
                {isBuffering && <Badge variant="outline" className="animate-pulse text-xs">
                    Buffering...
                  </Badge>}
                {timeRemaining && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    <Timer className="h-3 w-3 mr-1" />
                    {formatTime(timeRemaining)}
                  </Badge>}
              </div>
              <div className="flex items-center space-x-1">
                {getNetworkIcon()}
                <span className="text-xs text-muted-foreground">
                  {optimalQuality}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {duration > 0 && <div className="space-y-1">
                <div className="relative cursor-pointer py-1" onClick={handleProgressClick}>
                  <Progress value={getProgressPercentage()} className="h-1.5" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>}

            {/* Enhanced Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Button size="sm" variant="outline" onClick={playPreviousTrack} className="h-8 px-2" disabled={!isPlaying}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                
                <Button size="sm" variant="outline" onClick={skipBackward} disabled={!isPlaying} className="h-8 px-2">
                  <SkipBack className="h-3 w-3" />
                </Button>
                
                <Button size="sm" onClick={() => isPlaying ? pauseAudio() : playAudio(currentTrack)} className="bg-primary hover:bg-primary/90 h-8 px-3" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                
                <Button size="sm" variant="outline" onClick={skipForward} disabled={!isPlaying} className="h-8 px-2">
                  <SkipForward className="h-3 w-3" />
                </Button>
                
                <Button size="sm" variant="outline" onClick={playNextTrack} className="h-8 px-2" disabled={!isPlaying}>
                  <ChevronRight className="h-3 w-3" />
                </Button>
                
                <Button size="sm" variant={isLooping ? "default" : "outline"} onClick={toggleLoop} className={`h-8 px-2 ${isLooping ? 'bg-primary' : ''}`}>
                  <Repeat className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button size="sm" variant="outline" onClick={() => setShowTimerDialog(true)} className="h-8 px-2">
                  <Timer className="h-3 w-3" />
                </Button>
                
                
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              {volume === 0 ? <VolumeX className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : volume < 0.5 ? <Volume1 className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              <Slider value={[volume * 100]} onValueChange={value => changeVolume(value[0] / 100)} max={100} step={1} className="flex-1" />
              <span className="text-xs text-muted-foreground w-10 text-right flex-shrink-0">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>}
      </div>;
  };
  return <>
      <Card className="w-full max-w-none">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Calming Sounds</span>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
            <div className="flex items-center space-x-2">
              {timeRemaining && <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Timer className="h-3 w-3 mr-1" />
                  {formatTime(timeRemaining)}
                </Badge>}
              {isMobile && <Smartphone className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search sounds..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-10" />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="browse" className="flex items-center space-x-1 text-xs">
                <Music className="h-3 w-3" />
                <span>Browse</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center space-x-1 text-xs">
                <Heart className="h-3 w-3" />
                <span>Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center space-x-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>Recent</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category.id)} className="flex items-center space-x-1 h-8 px-3">
                    <category.icon className="h-3 w-3" />
                    <span className="text-xs">{category.name}</span>
                  </Button>)}
              </div>

              {/* Track List */}
              <div className="space-y-3">
                {filteredTracks.map(renderTrackCard)}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favoriteTracks.length > 0 ? <div className="space-y-3">
                  {favoriteTracks.map(renderTrackCard)}
                </div> : <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No favorite sounds yet</h3>
                  <p className="text-sm">Heart sounds to add them here</p>
                </div>}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {recentTracks.length > 0 ? <div className="space-y-3">
                  {recentTracks.map(renderTrackCard)}
                </div> : <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recently played sounds</h3>
                  <p className="text-sm">Play a sound to see it here</p>
                </div>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Timer Dialog */}
      <MobileAudioTimerDialog open={showTimerDialog} onOpenChange={setShowTimerDialog} onSetTimer={setAudioTimer} onSetCustomTimer={setAudioCustomTimer} onClearTimer={clearTimer} currentTimer={timer} timeRemaining={timeRemaining} formatTime={formatTime} isPlaying={isPlaying} />
    </>;
};