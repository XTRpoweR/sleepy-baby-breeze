
import { useState, useRef, useEffect } from 'react';

interface AudioTrack {
  id: string;
  name: string;
  category: 'white-noise' | 'lullaby' | 'nature';
  url: string;
  duration: number; // in seconds
}

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLooping, setIsLooping] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Mock audio tracks - in a real app, these would be actual audio files
  const audioTracks: AudioTrack[] = [
    {
      id: 'white-noise-1',
      name: 'Classic White Noise',
      category: 'white-noise',
      url: '#', // Mock URL
      duration: 3600
    },
    {
      id: 'white-noise-2',
      name: 'Rain on Window',
      category: 'white-noise',
      url: '#',
      duration: 3600
    },
    {
      id: 'lullaby-1',
      name: 'Brahms Lullaby',
      category: 'lullaby',
      url: '#',
      duration: 180
    },
    {
      id: 'lullaby-2',
      name: 'Twinkle Little Star',
      category: 'lullaby',
      url: '#',
      duration: 120
    },
    {
      id: 'nature-1',
      name: 'Ocean Waves',
      category: 'nature',
      url: '#',
      duration: 3600
    },
    {
      id: 'nature-2',
      name: 'Forest Birds',
      category: 'nature',
      url: '#',
      duration: 1800
    }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = isLooping;
    }
  }, [volume, isLooping]);

  useEffect(() => {
    if (timer && timeRemaining !== null && timeRemaining > 0) {
      timeUpdateRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev ? prev - 1 : 0);
      }, 1000);
    } else if (timeRemaining === 0) {
      stopAudio();
      setTimer(null);
      setTimeRemaining(null);
    }

    return () => {
      if (timeUpdateRef.current) {
        clearTimeout(timeUpdateRef.current);
      }
    };
  }, [timeRemaining]);

  const playAudio = (track: AudioTrack) => {
    try {
      setCurrentTrack(track);
      setIsPlaying(true);
      // In a real app, you would create and play the actual audio element here
      console.log(`Playing: ${track.name}`);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    console.log('Audio paused');
  };

  const stopAudio = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    console.log('Audio stopped');
  };

  const setAudioTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTimer(minutes);
    setTimeRemaining(seconds);
  };

  const clearTimer = () => {
    setTimer(null);
    setTimeRemaining(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return {
    audioTracks,
    isPlaying,
    currentTrack,
    currentTime,
    volume,
    isLooping,
    timer,
    timeRemaining,
    playAudio,
    pauseAudio,
    stopAudio,
    setVolume,
    setIsLooping,
    setAudioTimer,
    clearTimer
  };
};
