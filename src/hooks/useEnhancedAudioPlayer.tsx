
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAudioManager } from './useAudioManager';

interface AudioTrack {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'lullaby' | 'sleep' | 'white-noise';
  subcategory?: string;
  urls: {
    high: string;
    medium: string;
    low: string;
  };
  duration: number;
  description?: string;
}

export const useEnhancedAudioPlayer = () => {
  const {
    deviceCapabilities,
    qualitySettings,
    audioTracks,
    isAudioContextReady,
    getOptimalQuality,
    initializeAudioContext,
    setQualitySettings
  } = useAudioManager();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(deviceCapabilities.isMobile ? 0.5 : 0.7);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [networkAdaptive, setNetworkAdaptive] = useState(true);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false);
  const [preloadEnabled, setPreloadEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bufferCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced audio initialization for mobile devices
  useEffect(() => {
    if (deviceCapabilities.isMobile) {
      initializeAudioContext();
    }
  }, [deviceCapabilities.isMobile, initializeAudioContext]);

  // Monitor buffer health
  const checkBufferHealth = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    if (audio.buffered.length > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const currentTime = audio.currentTime;
      const bufferAhead = bufferedEnd - currentTime;
      
      // If less than 10 seconds buffered ahead, we're having buffering issues
      setBuffering(bufferAhead < 10);
    }
  }, []);

  // Network-adaptive quality adjustment
  useEffect(() => {
    if (networkAdaptive && isPlaying) {
      const interval = setInterval(() => {
        const optimalQuality = getOptimalQuality();
        if (optimalQuality !== currentQuality && audioRef.current && currentTrack) {
          console.log(`Adjusting quality from ${currentQuality} to ${optimalQuality}`);
          setCurrentQuality(optimalQuality);
          // Note: In production, this would smoothly transition to new quality
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [networkAdaptive, isPlaying, currentQuality, getOptimalQuality, currentTrack]);

  // Enhanced audio event handlers
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      checkBufferHealth();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
      setBuffering(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setDuration(audio.duration);
      setBuffering(false);
    };

    const handleWaiting = () => {
      setBuffering(true);
    };

    const handleCanPlayThrough = () => {
      setBuffering(false);
    };

    const handleError = (e: Event) => {
      setIsLoading(false);
      setBuffering(false);
      const audioError = (e.target as HTMLAudioElement).error;
      let errorMessage = 'Failed to load audio. Please try again.';
      
      if (audioError) {
        switch (audioError.code) {
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error. Please check your connection.';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio format not supported.';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio source not available.';
            break;
        }
      }
      
      setError(errorMessage);
      console.error('Audio error:', audioError);
    };

    const handleEnded = () => {
      if (!audio.loop) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    // Add all event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration));
    };
  }, [checkBufferHealth]);

  // Mobile-optimized play function
  const playAudio = useCallback(async (track: AudioTrack) => {
    // Ensure audio context is ready for mobile
    if (deviceCapabilities.isMobile && !isAudioContextReady) {
      await initializeAudioContext();
    }

    if (!audioRef.current) return;

    setError(null);
    
    // If it's the same track and playing, pause it
    if (currentTrack?.id === track.id && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    // If it's the same track but paused, resume
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
      const quality = getOptimalQuality();
      setCurrentQuality(quality);
      
      audioRef.current.src = track.urls[quality];
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;
      audioRef.current.loop = isLooping;
      
      // Preload if enabled
      if (preloadEnabled) {
        audioRef.current.preload = 'auto';
      }
      
      await audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      
      console.log(`Playing ${track.name} at ${quality} quality`);
    } catch (error) {
      console.error("Error playing audio:", error);
      setError('Failed to play audio. Please check your connection and try again.');
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [deviceCapabilities.isMobile, isAudioContextReady, initializeAudioContext, currentTrack, isPlaying, volume, isLooping, getOptimalQuality, preloadEnabled]);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => {
      const newLooping = !prev;
      if (audioRef.current) {
        audioRef.current.loop = newLooping;
      }
      return newLooping;
    });
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Audio tracks and state
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
    
    // Device and quality info
    deviceCapabilities,
    currentQuality,
    qualitySettings,
    networkAdaptive,
    crossfadeEnabled,
    preloadEnabled,
    
    // Playback controls
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    changeVolume,
    toggleLoop,
    
    // Settings
    setQualitySettings,
    setNetworkAdaptive,
    setCrossfadeEnabled,
    setPreloadEnabled,
    
    // Utilities
    formatTime,
    initializeAudioContext
  };
};
