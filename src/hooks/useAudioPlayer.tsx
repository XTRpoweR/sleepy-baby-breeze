
import { useState, useRef, useEffect } from 'react';

interface AudioTrack {
  id: string;
  name: string;
  category: 'white-noise' | 'lullaby' | 'nature';
  url: string;
  duration: number; // in seconds
  generator?: 'white-noise' | 'pink-noise' | 'brown-noise' | 'rain' | 'ocean' | 'forest' | 'lullaby';
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioScheduledSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Audio tracks with generators
  const audioTracks: AudioTrack[] = [
    {
      id: 'white-noise-1',
      name: 'Classic White Noise',
      category: 'white-noise',
      url: '#',
      duration: 3600,
      generator: 'white-noise'
    },
    {
      id: 'white-noise-2',
      name: 'Pink Noise',
      category: 'white-noise',
      url: '#',
      duration: 3600,
      generator: 'pink-noise'
    },
    {
      id: 'white-noise-3',
      name: 'Brown Noise',
      category: 'white-noise',
      url: '#',
      duration: 3600,
      generator: 'brown-noise'
    },
    {
      id: 'lullaby-1',
      name: 'Gentle Lullaby',
      category: 'lullaby',
      url: '#',
      duration: 180,
      generator: 'lullaby'
    },
    {
      id: 'nature-1',
      name: 'Ocean Waves',
      category: 'nature',
      url: '#',
      duration: 3600,
      generator: 'ocean'
    },
    {
      id: 'nature-2',
      name: 'Rain Sounds',
      category: 'nature',
      url: '#',
      duration: 3600,
      generator: 'rain'
    },
    {
      id: 'nature-3',
      name: 'Forest Birds',
      category: 'nature',
      url: '#',
      duration: 1800,
      generator: 'forest'
    }
  ];

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = volume;
    }
  };

  // Generate white noise
  const generateWhiteNoise = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  };

  // Generate pink noise
  const generatePinkNoise = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }
    
    return buffer;
  };

  // Generate brown noise
  const generateBrownNoise = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    let lastOut = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    
    return buffer;
  };

  // Generate ocean waves
  const generateOceanWaves = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      const wave1 = Math.sin(2 * Math.PI * 0.1 * t) * 0.5;
      const wave2 = Math.sin(2 * Math.PI * 0.05 * t) * 0.3;
      const noise = (Math.random() * 2 - 1) * 0.2;
      output[i] = wave1 + wave2 + noise;
    }
    
    return buffer;
  };

  // Generate rain sounds
  const generateRainSounds = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let sample = 0;
      // Multiple layers of filtered noise to simulate rain
      for (let j = 0; j < 5; j++) {
        const frequency = 1000 + j * 500;
        const t = i / audioContext.sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * (j + 1));
        sample += noise * 0.2;
      }
      output[i] = sample;
    }
    
    return buffer;
  };

  // Generate simple lullaby
  const generateLullaby = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Simple melody notes (frequencies in Hz)
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major scale
    const noteDuration = 0.5; // seconds per note
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      const noteIndex = Math.floor(t / noteDuration) % notes.length;
      const frequency = notes[noteIndex];
      const envelope = Math.exp(-((t % noteDuration) / noteDuration) * 2); // Decay envelope
      output[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    return buffer;
  };

  // Generate forest birds
  const generateForestBirds = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let sample = 0;
      
      // Simulate bird chirps with modulated sine waves
      if (Math.random() < 0.01) { // Random chirps
        const frequency = 800 + Math.random() * 1200;
        const chirpLength = 0.1;
        const envelope = Math.exp(-((t % 1) / chirpLength) * 10);
        sample += Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
      }
      
      // Background forest ambiance
      sample += (Math.random() * 2 - 1) * 0.05;
      
      output[i] = sample;
    }
    
    return buffer;
  };

  // Create audio source for generated sounds
  const createGeneratedAudio = async (track: AudioTrack) => {
    initAudioContext();
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const audioContext = audioContextRef.current;
    let buffer: AudioBuffer;

    switch (track.generator) {
      case 'white-noise':
        buffer = generateWhiteNoise(audioContext);
        break;
      case 'pink-noise':
        buffer = generatePinkNoise(audioContext);
        break;
      case 'brown-noise':
        buffer = generateBrownNoise(audioContext);
        break;
      case 'ocean':
        buffer = generateOceanWaves(audioContext);
        break;
      case 'rain':
        buffer = generateRainSounds(audioContext);
        break;
      case 'forest':
        buffer = generateForestBirds(audioContext);
        break;
      case 'lullaby':
        buffer = generateLullaby(audioContext);
        break;
      default:
        buffer = generateWhiteNoise(audioContext);
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = isLooping;
    source.connect(gainNodeRef.current);
    
    return source;
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

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

  const playAudio = async (track: AudioTrack) => {
    try {
      setIsLoading(true);
      
      // Stop any currently playing audio
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }

      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = await createGeneratedAudio(track);
      if (source) {
        sourceNodeRef.current = source;
        source.start();
        setCurrentTrack(track);
        setIsPlaying(true);
        console.log(`Now playing: ${track.name}`);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    console.log('Audio paused');
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    audioTracks,
    isPlaying,
    currentTrack,
    currentTime,
    volume,
    isLooping,
    timer,
    timeRemaining,
    isLoading,
    playAudio,
    pauseAudio,
    stopAudio,
    setVolume,
    setIsLooping,
    setAudioTimer,
    clearTimer
  };
};
