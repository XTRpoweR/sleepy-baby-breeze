import { useState, useRef, useEffect } from 'react';

// The interface has been simplified to use audio files directly
interface AudioTrack {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'lullaby' | 'sleep' | 'white-noise';
  subcategory?: string;
  url: string; // This is now the source of the audio
  duration: number; // in seconds
  description?: string;
  isFavorite?: boolean;
}

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLooping, setIsLooping] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ref for the main HTMLAudioElement
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // This Effect hook creates the audio player instance and sets up event listeners
  useEffect(() => {
    // Create the audio element instance only once
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoading = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      if (audio.loop) {
        // Audio will loop automatically if the `loop` property is true
      } else {
        stopAudio();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleLoading);
    audio.addEventListener('canplay', handleCanPlay);

    // Cleanup function on component unmount
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleLoading);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, []);

  // New audio tracks list (with correct file paths)
  const audioTracks: AudioTrack[] = [
    {
      id: 'meditative-rain',
      name: 'Meditative Rain',
      category: 'nature',
      subcategory: 'rain',
      url: '/sounds/meditative-rain-114484.mp3',
      duration: 0, // You can update duration later
      description: 'Calm and meditative rain sounds.'
    },
    {
      id: 'heavy-rain-drops',
      name: 'Heavy Rain Drops',
      category: 'nature',
      subcategory: 'rain',
      url: '/sounds/mixkit-heavy-rain-drops-2399.mp3',
      duration: 0,
      description: 'The sound of heavy rain.'
    },
    {
      id: 'fireplace-piano',
      name: 'Fireplace & Piano',
      category: 'ambient',
      url: '/sounds/crackling-fireplace-and-soft-piano-music-10454.mp3',
      duration: 0,
      description: 'A relaxing mix of crackling fire and soft piano.'
    },
    {
      id: 'sleep-of-nature',
      name: 'Sleep of Nature',
      category: 'nature',
      url: '/sounds/sleep-of-nature-short-pixabay-315677.mp3',
      duration: 0,
      description: 'Peaceful sounds from nature for sleeping.'
    },
    {
      id: 'water-fountain-healing',
      name: 'Water Fountain Healing',
      category: 'nature',
      subcategory: 'water',
      url: '/sounds/water-fountain-healing-music-239455.mp3',
      duration: 0,
      description: 'Healing music with a water fountain.'
    },
    {
      id: 'waves-sad-piano',
      name: 'Waves and Sad Piano',
      category: 'lullaby',
      subcategory: 'music',
      url: '/sounds/waves-and-tears-sad-piano-music-with-calm-ocean-waves-8164.mp3',
      duration: 0,
      description: 'Piano music mixed with ocean waves.'
    }
  ];

  // Updated audio playback functions
  const playAudio = async (track: AudioTrack) => {
    if (!audioRef.current) return;
    if (currentTrack?.id === track.id && isPlaying) {
      pauseAudio();
      return;
    }
    
    audioRef.current.src = track.url;
    try {
      await audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
      addToRecentlyPlayed(track.id);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Timer logic
  useEffect(() => {
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current);
    }
    if (isPlaying && timer) {
      const remaining = timer * 60 - (audioRef.current?.currentTime || 0);
      setTimeRemaining(remaining);

      timerTimeoutRef.current = setTimeout(() => {
        stopAudio();
        clearTimer();
      }, remaining * 1000);
    }
    return () => {
      if(timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current)
    }
  }, [timer, isPlaying, currentTrack]);
  
  const setAudioTimer = (minutes: number) => setTimer(minutes);
  const clearTimer = () => setTimer(null);

  // Helper functions (no change)
  const filteredTracks = audioTracks.filter(track => 
    searchQuery === '' || 
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const favoriteTracks = audioTracks.filter(track => favorites.includes(track.id));
  const recentTracks = recentlyPlayed.map(id => audioTracks.find(track => track.id === id)).filter(Boolean) as AudioTrack[];
  const toggleFavorite = (trackId: string) => setFavorites(prev => prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]);
  const addToRecentlyPlayed = (trackId: string) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== trackId);
      return [trackId, ...filtered].slice(0, 10);
    });
  };

  // Values to be returned by the hook
  return {
    audioTracks: filteredTracks,
    favoriteTracks,
    recentTracks,
    isPlaying,
    currentTrack,
    currentTime,
    volume,
    isLooping,
    timer,
    timeRemaining,
    isLoading,
    searchQuery,
    playAudio,
    pauseAudio,
    stopAudio,
    setVolume,
    setIsLooping,
    setAudioTimer,
    clearTimer,
    setSearchQuery,
    toggleFavorite,
    favorites
  };
};
