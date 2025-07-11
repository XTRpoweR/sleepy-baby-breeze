
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

  // Timer functionality
  const [timer, setTimer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [customTimer, setCustomTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

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

  // Initialize audio context and media session for mobile devices
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

    // Initialize Media Session API for background playback
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (currentTrack) playAudio(currentTrack);
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        pauseAudio();
      });

      navigator.mediaSession.setActionHandler('seekbackward', () => {
        skipBackward();
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        skipForward();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPreviousTrack();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNextTrack();
      });
    }
  }, [currentTrack]);

  // Request wake lock to prevent screen sleep during playback
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (error) {
      console.warn('Wake lock request failed:', error);
    }
  }, []);

  // Release wake lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
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

  // Timer logic with seconds precision
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    if (isPlaying && timer && timer > 0) {
      const timerInSeconds = timer * 60;
      setTimeRemaining(timerInSeconds);
      
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            clearTimerFunction();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timer, isPlaying]);

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
      
      // Update Media Session position state
      if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        });
      }
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
      requestWakeLock();
    };

    const handlePause = () => {
      releaseWakeLock();
    };

    const handleError = () => {
      setIsLoading(false);
      setIsBuffering(false);
      setError('Failed to load audio. Please check your connection.');
      releaseWakeLock();
    };

    const handleEnded = () => {
      if (!audio.loop) {
        setIsPlaying(false);
        setCurrentTime(0);
        releaseWakeLock();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      releaseWakeLock();
    };
  }, [detectNetworkType, initializeAudioContext, requestWakeLock, releaseWakeLock]);

  const updateMediaSessionMetadata = useCallback((track: AudioTrack) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.category.replace('-', ' '),
        album: track.description || 'Calming Sounds',
        artwork: [
          { src: '/favicon.ico', sizes: '96x96', type: 'image/png' },
        ],
      });
    }
  }, []);

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
      updateMediaSessionMetadata(track);
      
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

  // Skip forward (15 seconds)
  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + 15, duration);
      seekTo(newTime);
    }
  };

  // Skip backward (15 seconds)
  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 15, 0);
      seekTo(newTime);
    }
  };

  // Play next track
  const playNextTrack = () => {
    if (!currentTrack) return;
    
    const currentIndex = audioTracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % audioTracks.length;
    const nextTrack = audioTracks[nextIndex];
    
    playAudio(nextTrack);
  };

  // Play previous track
  const playPreviousTrack = () => {
    if (!currentTrack) return;
    
    const currentIndex = audioTracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? audioTracks.length - 1 : currentIndex - 1;
    const prevTrack = audioTracks[prevIndex];
    
    playAudio(prevTrack);
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

  // Timer functions
  const setAudioTimer = (minutes: number) => {
    setTimer(minutes);
  };
  
  const setAudioCustomTimer = (hours: number, minutes: number, seconds: number) => {
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    setTimer(totalMinutes);
    setCustomTimer({ hours, minutes, seconds });
  };
  
  const clearTimerFunction = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimer(null);
    setTimeRemaining(null);
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
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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
    
    // Timer state
    timer,
    timeRemaining,
    customTimer,
    
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
    skipForward,
    skipBackward,
    playNextTrack,
    playPreviousTrack,
    changeVolume,
    toggleLoop,
    
    // Timer controls
    setAudioTimer,
    setAudioCustomTimer,
    clearTimer: clearTimerFunction,
    
    // Audio settings
    setAudioQuality,
    
    // Utility functions
    setSearchQuery,
    toggleFavorite,
    formatTime
  };
};
