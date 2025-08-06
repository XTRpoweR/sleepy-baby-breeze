import { useState, useRef, useEffect } from 'react';

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

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLooping, setIsLooping] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Updated audio tracks with correct file paths
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

  // Initialize Media Session API for background playback controls
  const initializeMediaSession = () => {
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
  };

  // Update media session metadata when track changes
  const updateMediaSessionMetadata = (track: AudioTrack) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.category.replace('-', ' '),
        album: track.description || 'Calming Sounds',
        artwork: [
          { src: '/lovable-uploads/d464ff16-7245-484a-86cb-68f2fc44bb12.png', sizes: '96x96', type: 'image/png' },
          { src: '/lovable-uploads/d464ff16-7245-484a-86cb-68f2fc44bb12.png', sizes: '128x128', type: 'image/png' },
          { src: '/lovable-uploads/d464ff16-7245-484a-86cb-68f2fc44bb12.png', sizes: '192x192', type: 'image/png' },
          { src: '/lovable-uploads/d464ff16-7245-484a-86cb-68f2fc44bb12.png', sizes: '256x256', type: 'image/png' },
          { src: '/lovable-uploads/d464ff16-7245-484a-86cb-68f2fc44bb12.png', sizes: '384x384', type: 'image/png' },
          { src: '/lovable-uploads/d464ff16-7245-484a-86cb-68f2fc44bb12.png', sizes: '512x512', type: 'image/png' },
        ],
      });
    }
  };

  useEffect(() => {
    initializeMediaSession();
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
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
      setDuration(audio.duration);
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load audio. Please try again.');
      console.error('Audio loading error:', audio.error);
    };

    const handleEnded = () => {
      if (isLooping) {
        // If loop is enabled, the audio will loop automatically
        return;
      } else if (autoplay) {
        // Auto-play next track when current track ends
        playNextTrack();
      } else {
        // Stop playback if auto-play is disabled
        stopAudio();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (audio) {
        audio.pause();
      }
    };
  }, [autoplay, isLooping]);

  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    if (isPlaying && timer && timer > 0) {
      const timerInSeconds = timer * 60;
      setTimeRemaining(timerInSeconds);
      
      // Use interval for second-by-second countdown
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            // Stop the audio when timer reaches zero
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

  const playNextTrack = () => {
    if (!currentTrack) return;
    
    const currentIndex = audioTracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % audioTracks.length;
    const nextTrack = audioTracks[nextIndex];
    
    playAudio(nextTrack);
  };

  const playPreviousTrack = () => {
    if (!currentTrack) return;
    
    const currentIndex = audioTracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? audioTracks.length - 1 : currentIndex - 1;
    const prevTrack = audioTracks[prevIndex];
    
    playAudio(prevTrack);
  };

  const playAudio = async (track: AudioTrack) => {
    if (!audioRef.current) return;
    
    setError(null);
    
    // If it's the same track and it's currently playing, pause it
    if (currentTrack?.id === track.id && isPlaying) {
      pauseAudio();
      return;
    }
    
    // If it's the same track but paused, resume from current position
    if (currentTrack?.id === track.id && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch (error) {
        console.error("Error resuming audio:", error);
        setError('Failed to resume audio. Please try again.');
        return;
      }
    }
    
    // Playing a new track
    try {
      setIsLoading(true);
      audioRef.current.src = track.url;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.currentTime = 0; // Start from beginning for new tracks
      
      await audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      addToRecentlyPlayed(track.id);
      updateMediaSessionMetadata(track);
      
      if (fadeIn) {
        startFadeIn();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setError('Failed to play audio. Please check your connection and try again.');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const stopAudio = () => {
    if (fadeOut) {
      startFadeOut(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTrack(null);
        setCurrentTime(0);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTrack(null);
      setCurrentTime(0);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + 15, duration);
      seekTo(newTime);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 15, 0);
      seekTo(newTime);
    }
  };

  const volumeUp = () => {
    const newVolume = Math.min(volume + 0.1, 1);
    setVolume(newVolume);
  };

  const volumeDown = () => {
    const newVolume = Math.max(volume - 0.1, 0);
    setVolume(newVolume);
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const startFadeIn = () => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = 0;
    let currentVol = 0;
    const targetVol = volume;
    const step = targetVol / 20; // 20 steps for smooth fade
    
    fadeIntervalRef.current = setInterval(() => {
      currentVol += step;
      if (currentVol >= targetVol) {
        currentVol = targetVol;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }
      if (audioRef.current) {
        audioRef.current.volume = currentVol;
      }
    }, 100);
  };

  const startFadeOut = (callback?: () => void) => {
    if (!audioRef.current) return;
    
    let currentVol = volume;
    const step = volume / 20;
    
    fadeIntervalRef.current = setInterval(() => {
      currentVol -= step;
      if (currentVol <= 0) {
        currentVol = 0;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        if (callback) callback();
      }
      if (audioRef.current) {
        audioRef.current.volume = currentVol;
      }
    }, 100);
  };

  useEffect(() => {
    if (audioRef.current && !fadeIntervalRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const setAudioTimer = (minutes: number) => {
    console.log('Setting timer for:', minutes, 'minutes');
    setTimer(minutes);
  };
  
  const setCustomTimer = (hours: number, minutes: number, seconds: number) => {
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    console.log('Setting custom timer for:', totalMinutes, 'minutes');
    setTimer(totalMinutes);
  };
  
  const clearTimerFunction = () => {
    console.log('Clearing timer');
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimer(null);
    setTimeRemaining(null);
  };

  // Helper functions
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

  const toggleFavorite = (trackId: string) => 
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId) 
        : [...prev, trackId]
    );

  const addToRecentlyPlayed = (trackId: string) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== trackId);
      return [trackId, ...filtered].slice(0, 10);
    });
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
    error,
    playbackRate,
    autoplay,
    
    // Timer state
    timer,
    timeRemaining,
    
    // Settings
    searchQuery,
    favorites,
    fadeIn,
    fadeOut,
    
    // Playback controls
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    skipForward,
    skipBackward,
    playNextTrack,
    playPreviousTrack,
    
    // Volume controls
    setVolume,
    volumeUp,
    volumeDown,
    
    // Advanced controls
    setIsLooping,
    changePlaybackRate,
    setFadeIn,
    setFadeOut,
    setAutoplay,
    
    // Timer controls
    setAudioTimer,
    setCustomTimer,
    clearTimer: clearTimerFunction,
    
    // Utility functions
    setSearchQuery,
    toggleFavorite,
    formatTime
  };
};
