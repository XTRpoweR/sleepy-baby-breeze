
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Loader2,
  Search,
  Heart,
  Clock,
  Droplets,
  Bird,
  Flame,
  Coffee,
  BrainCircuit,
  Baby
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AudioTimerDialog } from './AudioTimerDialog';

interface SoundsLibraryProps {
  onSoundSelect?: (sound: any) => void;
}

export const SoundsLibrary = ({ onSoundSelect }: SoundsLibraryProps) => {
  const {
    audioTracks,
    favoriteTracks,
    recentTracks,
    isPlaying,
    currentTrack,
    volume,
    isLooping,
    timer,
    timeRemaining,
    isLoading,
    searchQuery,
    favorites,
    playAudio,
    pauseAudio,
    stopAudio,
    setVolume,
    setIsLooping,
    setAudioTimer,
    clearTimer,
    setSearchQuery,
    toggleFavorite
  } = useAudioPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  const categories = [
    { id: 'all', name: 'All Sounds', icon: Music },
    { id: 'nature', name: 'Nature', icon: Waves },
    { id: 'ambient', name: 'Ambient', icon: Coffee },
    { id: 'lullaby', name: 'Lullabies', icon: Baby },
    { id: 'sleep', name: 'Sleep', icon: BrainCircuit },
    { id: 'white-noise', name: 'White Noise', icon: Wind }
  ];

  const subcategories = {
    nature: [
      { id: 'all', name: 'All Nature', icon: Waves },
      { id: 'rain', name: 'Rain', icon: Droplets },
      { id: 'water', name: 'Water', icon: Waves },
      { id: 'birds', name: 'Birds', icon: Bird },
      { id: 'fire', name: 'Fire', icon: Flame },
      { id: 'wind', name: 'Wind', icon: Wind }
    ]
  };

  const getFilteredTracks = () => {
    let filtered = audioTracks;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(track => track.category === selectedCategory);
    }

    if (selectedSubcategory !== 'all' && selectedCategory === 'nature') {
      filtered = filtered.filter(track => track.subcategory === selectedSubcategory);
    }

    return filtered;
  };

  const filteredTracks = getFilteredTracks();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const getCategoryColors = (category: string, isActive = false, isPlaying = false) => {
    const colorMap = {
      'nature': {
        primary: isActive && isPlaying ? 'bg-green-600' : 'bg-green-500',
        secondary: isActive && isPlaying ? 'bg-green-50' : 'bg-green-50',
        accent: 'text-green-600',
        ring: 'ring-green-200',
        badge: 'bg-green-100 text-green-800',
        gradient: 'from-green-50 to-green-100',
        button: 'bg-green-600 hover:bg-green-700'
      },
      'ambient': {
        primary: isActive && isPlaying ? 'bg-amber-600' : 'bg-amber-500',
        secondary: isActive && isPlaying ? 'bg-amber-50' : 'bg-amber-50',
        accent: 'text-amber-600',
        ring: 'ring-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        gradient: 'from-amber-50 to-amber-100',
        button: 'bg-amber-600 hover:bg-amber-700'
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
      'sleep': {
        primary: isActive && isPlaying ? 'bg-indigo-600' : 'bg-indigo-500',
        secondary: isActive && isPlaying ? 'bg-indigo-50' : 'bg-indigo-50',
        accent: 'text-indigo-600',
        ring: 'ring-indigo-200',
        badge: 'bg-indigo-100 text-indigo-800',
        gradient: 'from-indigo-50 to-indigo-100',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      },
      'white-noise': {
        primary: isActive && isPlaying ? 'bg-gray-600' : 'bg-gray-500',
        secondary: isActive && isPlaying ? 'bg-gray-50' : 'bg-gray-50',
        accent: 'text-gray-600',
        ring: 'ring-gray-200',
        badge: 'bg-gray-100 text-gray-800',
        gradient: 'from-gray-50 to-gray-100',
        button: 'bg-gray-600 hover:bg-gray-700'
      }
    };
    
    return colorMap[category as keyof typeof colorMap] || colorMap['nature'];
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
                  {track.subcategory && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-purple-600" />
            <span>Calming Sounds Library</span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs for organization */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browse" className="flex items-center space-x-2">
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Browse</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Recent</span>
              </TabsTrigger>
              <TabsTrigger value="playing" className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Now Playing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedSubcategory('all');
                    }}
                    className="flex items-center space-x-2"
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>

              {/* Subcategory Filter for Nature */}
              {selectedCategory === 'nature' && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {subcategories.nature.map((subcategory) => (
                    <Button
                      key={subcategory.id}
                      variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubcategory(subcategory.id)}
                      className="flex items-center space-x-2"
                    >
                      <subcategory.icon className="h-3 w-3" />
                      <span className="text-xs">{subcategory.name}</span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Track List */}
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
                <div className="text-center py-8 text-gray-500">
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
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No recently played sounds</p>
                  <p className="text-sm">Play a sound to see it here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="playing" className="space-y-4">
              {/* Current Playing Track */}
              {currentTrack && !onSoundSelect ? (
                <Card className={`bg-gradient-to-r ${getCategoryColors(currentTrack.category, true, isPlaying).gradient} border-2 ${getCategoryColors(currentTrack.category, true, isPlaying).ring.replace('ring-', 'border-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={getCategoryColors(currentTrack.category, true, isPlaying).accent}>
                          {getCategoryIcon(currentTrack.category)}
                        </div>
                        <div>
                          <h3 className="font-medium">{currentTrack.name}</h3>
                          <p className="text-sm text-gray-600">{currentTrack.description}</p>
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Volume2 className="h-8 w-8 mx-auto mb-2" />
                  <p>No sound currently playing</p>
                  <p className="text-sm">Select a sound to start playing</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
