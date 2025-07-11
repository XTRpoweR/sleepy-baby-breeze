
import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioTrack {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'lullaby' | 'sleep' | 'white-noise';
  subcategory?: string;
  url: string;
  duration: number;
  description?: string;
  isFavorite?: boolean;
}

interface AudioQuality {
  bitrate: string;
  label: string;
  url: string;
}

export const useMobileAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [audioQuality, setAudioQuality] = useState<'auto' | 'high' | 'medium' | 'low'>('auto');
  const [isBuffering, setIsBuffering] = useState(false);
  const [networkType, setNetworkType] = useState<string>('unknown');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio tracks with multiple quality options
  const audioTracks: AudioTrack[] = [
    {
      id: 'heavy-rain-drops',
      name: 'Heavy Rain Drops',
      category: 'nature',
      subcategory: 'rain',
      url: '/sounds/mixkit-heavy-rain-drops-2399.mp3',
      duration: 0,
      description: 'The sound of heavy rain drops for relaxation.'
    },
    {
      id: 'water-fountain-healing',
      name: 'Water Fountain Healing',
      category: 'nature',
      subcategory: 'water',
      url: '/sounds/water-fountain-healing-music-239455.mp3',
      duration: 0,
      description: 'Healing music with a peaceful water fountain.'
    },
    {
      id: 'waves-sad-piano',
      name: 'Waves and Piano',
      category: 'lullaby',
      subcategory: 'music',
      url: '/sounds/waves-and-tears-sad-piano-music-with-calm-ocean-waves-8164.mp3',
      duration: 0,
      description: 'Calming piano music mixed with gentle ocean waves.'
    },
    {
      id: 'dark-atmosphere-rain',
      name: 'Dark Atmosphere Rain',
      category: 'nature',
      subcategory: 'rain',
      url: '/sounds/dark-atmosphere-with-rain-352570.mp3',
      duration: 0,
      description: 'Deep atmospheric rain sounds for deep relaxation.'
    },
    {
      id: 'nature-investigation',
      name: 'Nature Investigation',
      category: 'nature',
      url: '/sounds/nature-investigation-255161.mp3',
      duration: 0,
      description: 'Natural ambient sounds for peaceful meditation.'
    },
    {
      id: 'soft-birds-sound',
      name: 'Soft Bird Sounds',
      category: 'nature',
      subcategory: 'birds',
      url: '/sounds/soft-birds-sound-304132.mp3',
      duration: 0,
      description: 'Gentle bird chirping for a peaceful atmosphere.'
    }
  ];

  // Detect device and network capabilities
  const detectNetworkType = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkType(connection.effectiveType || 'unknown');
    }
  }, []);

  // Initialize audio context for mobile devices
  const initializeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.warn('Audio context initialization failed:', error);
      }
    }
  }, []);

  // Auto-select quality based on device and network
  const getOptimalQuality = useCallback(() => {
    if (audioQuality !== 'auto') return audioQuality;
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (networkType === 'slow-2g' || networkType === '2g') return 'low';
    if (networkType === '3g' || isMobile) return 'medium';
    return 'high';
  }, [audioQuality, networkType]);

  useEffect(() => {
    detectNetworkType();
    initializeAudioContext();

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
      setDuration(audio.duration);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsBuffering(false);
      setError('Failed to load audio. Please check your connection.');
    };

    const handleEnded = () => {
      if (!audio.loop) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [detectNetworkType, initializeAudioContext]);

  const playAudio = async (track: AudioTrack) => {
    if (!audioRef.current) return;

    await initializeAudioContext();
    
    try {
      setError(null);
      
      if (currentTrack?.id === track.id && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
      
      if (currentTrack?.id === track.id && !isPlaying) {
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      }
      
      setIsLoading(true);
      audioRef.current.src = track.url;
      audioRef.current.volume = volume;
      audioRef.current.loop = isLooping;
      
      await audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
      addToRecentlyPlayed(track.id);
      
    } catch (error) {
      console.error('Audio playback failed:', error);
      setError('Playback failed. Tap to retry.');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleLoop = () => {
    const newLooping = !isLooping;
    setIsLooping(newLooping);
    if (audioRef.current) {
      audioRef.current.loop = newLooping;
    }
  };

  const addToRecentlyPlayed = (trackId: string) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== trackId);
      return [trackId, ...filtered].slice(0, 10);
    });
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter tracks based on search
  const filteredTracks = audioTracks.filter(track => 
    searchQuery === '' || 
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteTracks = audioTracks.filter(track => favorites.includes(track.id));
  const recentTracks = recentlyPlayed
    .map(id => audioTracks.find(track => track.id === id))
    .filter(Boolean) as AudioTrack[];

  return {
    // Audio tracks and lists
    audioTracks: filteredTracks,
    favoriteTracks,
    recentTracks,
    
    // Playback state
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isLooping,
    isLoading,
    isBuffering,
    error,
    
    // Audio quality and network
    audioQuality,
    networkType,
    optimalQuality: getOptimalQuality(),
    
    // Search and preferences
    searchQuery,
    favorites,
    
    // Playback controls
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    changeVolume,
    toggleLoop,
    
    // Audio settings
    setAudioQuality,
    
    // Utility functions
    setSearchQuery,
    toggleFavorite,
    formatTime
  };
};
