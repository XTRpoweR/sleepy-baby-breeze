import { useState, useRef, useEffect } from 'react';

interface AudioTrack {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'lullaby' | 'sleep' | 'white-noise';
  subcategory?: string;
  url: string;
  duration: number; // in seconds
  generator?: string;
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
  const [mixedTracks, setMixedTracks] = useState<AudioTrack[]>([]);
  const [mixVolumes, setMixVolumes] = useState<Record<string, number>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioScheduledSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const mixSourcesRef = useRef<Map<string, AudioScheduledSourceNode>>(new Map());

  // Comprehensive audio tracks library
  const audioTracks: AudioTrack[] = [
    // Nature Sounds - Rain
    {
      id: 'rain-light',
      name: 'Light Rain',
      category: 'nature',
      subcategory: 'rain',
      url: '#',
      duration: 3600,
      generator: 'light-rain',
      description: 'Gentle droplets on leaves'
    },
    {
      id: 'rain-heavy',
      name: 'Heavy Rain',
      category: 'nature',
      subcategory: 'rain',
      url: '#',
      duration: 3600,
      generator: 'heavy-rain',
      description: 'Intense rainfall sounds'
    },
    {
      id: 'rain-roof',
      name: 'Rain on Roof',
      category: 'nature',
      subcategory: 'rain',
      url: '#',
      duration: 3600,
      generator: 'rain-roof',
      description: 'Cozy indoor rain sounds'
    },
    {
      id: 'thunderstorm',
      name: 'Thunderstorm',
      category: 'nature',
      subcategory: 'rain',
      url: '#',
      duration: 3600,
      generator: 'thunderstorm',
      description: 'Rain with distant thunder'
    },

    // Nature Sounds - Ocean & Water
    {
      id: 'ocean-gentle',
      name: 'Gentle Ocean Waves',
      category: 'nature',
      subcategory: 'water',
      url: '#',
      duration: 3600,
      generator: 'ocean-gentle',
      description: 'Soft waves on the shore'
    },
    {
      id: 'ocean-strong',
      name: 'Strong Ocean Waves',
      category: 'nature',
      subcategory: 'water',
      url: '#',
      duration: 3600,
      generator: 'ocean-strong',
      description: 'Powerful wave sounds'
    },
    {
      id: 'beach-ambiance',
      name: 'Beach Ambiance',
      category: 'nature',
      subcategory: 'water',
      url: '#',
      duration: 3600,
      generator: 'beach-ambiance',
      description: 'Complete beach atmosphere'
    },
    {
      id: 'stream',
      name: 'Babbling Brook',
      category: 'nature',
      subcategory: 'water',
      url: '#',
      duration: 3600,
      generator: 'stream',
      description: 'Peaceful flowing water'
    },
    {
      id: 'waterfall',
      name: 'Waterfall',
      category: 'nature',
      subcategory: 'water',
      url: '#',
      duration: 3600,
      generator: 'waterfall',
      description: 'Cascading water sounds'
    },

    // Nature Sounds - Birds
    {
      id: 'forest-birds',
      name: 'Forest Birds',
      category: 'nature',
      subcategory: 'birds',
      url: '#',
      duration: 1800,
      generator: 'forest-birds',
      description: 'Chirping in the woods'
    },
    {
      id: 'morning-birds',
      name: 'Morning Chorus',
      category: 'nature',
      subcategory: 'birds',
      url: '#',
      duration: 1800,
      generator: 'morning-birds',
      description: 'Dawn bird symphony'
    },
    {
      id: 'owls',
      name: 'Night Owls',
      category: 'nature',
      subcategory: 'birds',
      url: '#',
      duration: 1800,
      generator: 'owls',
      description: 'Peaceful owl calls'
    },
    {
      id: 'songbirds',
      name: 'Songbirds',
      category: 'nature',
      subcategory: 'birds',
      url: '#',
      duration: 1800,
      generator: 'songbirds',
      description: 'Melodic bird songs'
    },

    // Nature Sounds - Fire
    {
      id: 'fireplace',
      name: 'Crackling Fireplace',
      category: 'nature',
      subcategory: 'fire',
      url: '#',
      duration: 3600,
      generator: 'fireplace',
      description: 'Cozy fireplace sounds'
    },
    {
      id: 'campfire',
      name: 'Campfire',
      category: 'nature',
      subcategory: 'fire',
      url: '#',
      duration: 3600,
      generator: 'campfire',
      description: 'Outdoor fire crackling'
    },
    {
      id: 'gentle-fire',
      name: 'Gentle Embers',
      category: 'nature',
      subcategory: 'fire',
      url: '#',
      duration: 3600,
      generator: 'gentle-fire',
      description: 'Soft ember sounds'
    },

    // Nature Sounds - Wind
    {
      id: 'gentle-breeze',
      name: 'Gentle Breeze',
      category: 'nature',
      subcategory: 'wind',
      url: '#',
      duration: 3600,
      generator: 'gentle-breeze',
      description: 'Soft wind through trees'
    },
    {
      id: 'forest-wind',
      name: 'Forest Wind',
      category: 'nature',
      subcategory: 'wind',
      url: '#',
      duration: 3600,
      generator: 'forest-wind',
      description: 'Wind in the forest'
    },
    {
      id: 'mountain-wind',
      name: 'Mountain Wind',
      category: 'nature',
      subcategory: 'wind',
      url: '#',
      duration: 3600,
      generator: 'mountain-wind',
      description: 'High altitude breeze'
    },

    // Ambient Sounds
    {
      id: 'cafe-ambiance',
      name: 'Cafe Atmosphere',
      category: 'ambient',
      url: '#',
      duration: 3600,
      generator: 'cafe-ambiance',
      description: 'Cozy coffee shop sounds'
    },
    {
      id: 'library-atmosphere',
      name: 'Library Quiet',
      category: 'ambient',
      url: '#',
      duration: 3600,
      generator: 'library-atmosphere',
      description: 'Peaceful library ambiance'
    },
    {
      id: 'distant-traffic',
      name: 'Distant Traffic',
      category: 'ambient',
      url: '#',
      duration: 3600,
      generator: 'distant-traffic',
      description: 'Urban background hum'
    },
    {
      id: 'clock-ticking',
      name: 'Clock Ticking',
      category: 'ambient',
      url: '#',
      duration: 3600,
      generator: 'clock-ticking',
      description: 'Rhythmic clock sounds'
    },
    {
      id: 'heartbeat',
      name: 'Heartbeat Rhythm',
      category: 'ambient',
      url: '#',
      duration: 3600,
      generator: 'heartbeat',
      description: 'Calming heartbeat pattern'
    },

    // Enhanced Lullabies
    {
      id: 'gentle-lullaby',
      name: 'Gentle Lullaby',
      category: 'lullaby',
      url: '#',
      duration: 300,
      generator: 'gentle-lullaby',
      description: 'Soft melodic lullaby'
    },
    {
      id: 'humming-melody',
      name: 'Humming Melody',
      category: 'lullaby',
      url: '#',
      duration: 300,
      generator: 'humming-melody',
      description: 'Gentle humming sounds'
    },
    {
      id: 'music-box',
      name: 'Music Box',
      category: 'lullaby',
      url: '#',
      duration: 300,
      generator: 'music-box',
      description: 'Classic music box tune'
    },
    {
      id: 'soft-piano',
      name: 'Soft Piano',
      category: 'lullaby',
      url: '#',
      duration: 300,
      generator: 'soft-piano',
      description: 'Peaceful piano melody'
    },

    // Sleep Sounds
    {
      id: 'deep-sleep-frequency',
      name: 'Deep Sleep Frequency',
      category: 'sleep',
      url: '#',
      duration: 3600,
      generator: 'deep-sleep-frequency',
      description: 'Low frequency for deep sleep'
    },
    {
      id: 'binaural-relaxation',
      name: 'Binaural Relaxation',
      category: 'sleep',
      url: '#',
      duration: 3600,
      generator: 'binaural-relaxation',
      description: 'Binaural beats for calm'
    },
    {
      id: 'breathing-guide',
      name: 'Breathing Guide',
      category: 'sleep',
      url: '#',
      duration: 1800,
      generator: 'breathing-guide',
      description: 'Rhythmic breathing sounds'
    },

    // White Noise (Enhanced)
    {
      id: 'white-noise-classic',
      name: 'Classic White Noise',
      category: 'white-noise',
      url: '#',
      duration: 3600,
      generator: 'white-noise',
      description: 'Pure white noise'
    },
    {
      id: 'pink-noise',
      name: 'Pink Noise',
      category: 'white-noise',
      url: '#',
      duration: 3600,
      generator: 'pink-noise',
      description: 'Warmer pink noise'
    },
    {
      id: 'brown-noise',
      name: 'Brown Noise',
      category: 'white-noise',
      url: '#',
      duration: 3600,
      generator: 'brown-noise',
      description: 'Deep brown noise'
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

  // Enhanced audio generators with better quality
  const generateLightRain = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let sample = 0;
      // Light rain simulation with gentle droplets
      if (Math.random() < 0.02) {
        const droplet = Math.random() * 0.3;
        sample += droplet * Math.exp(-((i % 1000) / 1000) * 5);
      }
      // Background rain ambiance
      sample += (Math.random() * 2 - 1) * 0.1;
      output[i] = sample;
    }
    
    return buffer;
  };

  const generateHeavyRain = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let sample = 0;
      // Heavy rain with more frequent droplets
      if (Math.random() < 0.08) {
        const droplet = Math.random() * 0.5;
        sample += droplet * Math.exp(-((i % 500) / 500) * 3);
      }
      // Stronger background rain
      sample += (Math.random() * 2 - 1) * 0.3;
      output[i] = sample;
    }
    
    return buffer;
  };

  const generateThunderstorm = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let sample = 0;
      
      // Heavy rain base
      if (Math.random() < 0.08) {
        sample += Math.random() * 0.4;
      }
      
      // Distant thunder every 30-60 seconds
      if (Math.random() < 0.0001) {
        const thunderFreq = 20 + Math.random() * 50;
        const envelope = Math.exp(-t * 0.1);
        sample += Math.sin(2 * Math.PI * thunderFreq * t) * envelope * 0.6;
      }
      
      output[i] = sample;
    }
    
    return buffer;
  };

  const generateFireplace = (audioContext: AudioContext, duration: number = 2) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let sample = 0;
      
      // Base fire hum
      sample += (Math.random() * 2 - 1) * 0.1;
      
      // Random crackling sounds
      if (Math.random() < 0.005) {
        const crackleFreq = 200 + Math.random() * 800;
        const crackleLength = 0.1;
        const t = (i % (audioContext.sampleRate * crackleLength)) / audioContext.sampleRate;
        const envelope = Math.exp(-t * 10);
        sample += Math.sin(2 * Math.PI * crackleFreq * t) * envelope * 0.4;
      }
      
      // Wood popping sounds
      if (Math.random() < 0.001) {
        sample += (Math.random() * 2 - 1) * 0.6;
      }
      
      output[i] = sample;
    }
    
    return buffer;
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
      case 'light-rain':
        buffer = generateLightRain(audioContext);
        break;
      case 'heavy-rain':
        buffer = generateHeavyRain(audioContext);
        break;
      case 'thunderstorm':
        buffer = generateThunderstorm(audioContext);
        break;
      case 'fireplace':
        buffer = generateFireplace(audioContext);
        break;
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
        buffer = generateLightRain(audioContext);
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = isLooping;
    source.connect(gainNodeRef.current);
    
    return source;
  };

  // Filter tracks based on search query
  const filteredTracks = audioTracks.filter(track => 
    searchQuery === '' || 
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get favorite tracks
  const favoriteTracks = audioTracks.filter(track => favorites.includes(track.id));

  // Get recently played tracks
  const recentTracks = recentlyPlayed
    .map(id => audioTracks.find(track => track.id === id))
    .filter(Boolean) as AudioTrack[];

  // Add to favorites
  const toggleFavorite = (trackId: string) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  // Add to recently played
  const addToRecentlyPlayed = (trackId: string) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== trackId);
      return [trackId, ...filtered].slice(0, 10); // Keep last 10
    });
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
        addToRecentlyPlayed(track.id);
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
