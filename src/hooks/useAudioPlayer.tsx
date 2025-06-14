
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioScheduledSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);

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

  // Utility function to apply low-pass filter for warmer sound
  const applyLowPassFilter = (audioContext: AudioContext, source: AudioScheduledSourceNode, frequency: number = 8000) => {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = frequency;
    filter.Q.value = 1;
    source.connect(filter);
    return filter;
  };

  // Enhanced audio generators with much better quality and longer duration
  const generateLightRain = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate); // Stereo
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Create multiple layers for realistic rain
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let leftSample = 0;
      let rightSample = 0;
      
      // Base rain texture with filtered noise
      const baseNoise = (Math.random() * 2 - 1) * 0.15;
      const filteredNoise = baseNoise * Math.exp(-Math.abs(baseNoise) * 3);
      
      // Individual droplets with spatial positioning
      if (Math.random() < 0.015) {
        const dropletIntensity = 0.1 + Math.random() * 0.3;
        const pan = Math.random() * 2 - 1; // -1 to 1 for stereo positioning
        const decay = Math.exp(-((i % 2000) / 2000) * 8);
        
        leftSample += dropletIntensity * decay * Math.max(0, 1 - pan);
        rightSample += dropletIntensity * decay * Math.max(0, 1 + pan);
      }
      
      // Distant rain ambiance
      const ambiance = Math.sin(t * 0.1) * filteredNoise * 0.8;
      
      leftChannel[i] = leftSample + ambiance + filteredNoise;
      rightChannel[i] = rightSample + ambiance + filteredNoise;
    }
    
    return buffer;
  };

  const generateHeavyRain = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let leftSample = 0;
      let rightSample = 0;
      
      // Intense base rain
      const heavyNoise = (Math.random() * 2 - 1) * 0.35;
      
      // Frequent heavy droplets
      if (Math.random() < 0.05) {
        const dropletIntensity = 0.2 + Math.random() * 0.6;
        const pan = Math.random() * 2 - 1;
        const decay = Math.exp(-((i % 1000) / 1000) * 6);
        
        leftSample += dropletIntensity * decay * Math.max(0, 1 - pan);
        rightSample += dropletIntensity * decay * Math.max(0, 1 + pan);
      }
      
      // Heavy rain background with multiple frequency layers
      const layer1 = Math.sin(t * 0.2) * heavyNoise * 0.6;
      const layer2 = Math.sin(t * 0.15) * heavyNoise * 0.4;
      
      leftChannel[i] = leftSample + layer1 + layer2 + heavyNoise;
      rightChannel[i] = rightSample + layer1 + layer2 + heavyNoise;
    }
    
    return buffer;
  };

  const generateRainOnRoof = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let leftSample = 0;
      let rightSample = 0;
      
      // Roof impact sounds - sharper and more defined
      if (Math.random() < 0.025) {
        const impactFreq = 800 + Math.random() * 1200;
        const impactLength = 0.05;
        const impactT = (i % (audioContext.sampleRate * impactLength)) / audioContext.sampleRate;
        const envelope = Math.exp(-impactT * 20);
        const impact = Math.sin(2 * Math.PI * impactFreq * impactT) * envelope * 0.4;
        
        const pan = Math.random() * 2 - 1;
        leftSample += impact * Math.max(0, 1 - pan);
        rightSample += impact * Math.max(0, 1 + pan);
      }
      
      // Roof resonance - lower frequency rumble
      const resonance = Math.sin(t * 50 + Math.sin(t * 0.3) * 2) * 0.1;
      
      // Base rain texture
      const baseNoise = (Math.random() * 2 - 1) * 0.2;
      
      leftChannel[i] = leftSample + resonance + baseNoise;
      rightChannel[i] = rightSample + resonance + baseNoise;
    }
    
    return buffer;
  };

  const generateThunderstorm = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let leftSample = 0;
      let rightSample = 0;
      
      // Heavy rain base
      const rainNoise = (Math.random() * 2 - 1) * 0.3;
      if (Math.random() < 0.06) {
        const droplet = Math.random() * 0.5;
        const pan = Math.random() * 2 - 1;
        leftSample += droplet * Math.max(0, 1 - pan);
        rightSample += droplet * Math.max(0, 1 + pan);
      }
      
      // Distant thunder every 8-15 seconds
      const thunderInterval = 10 + Math.sin(t * 0.1) * 3;
      if (Math.random() < (1 / (thunderInterval * audioContext.sampleRate))) {
        const thunderFreq = 15 + Math.random() * 40;
        const thunderDuration = 2 + Math.random() * 3;
        const thunderT = (t % thunderDuration) / thunderDuration;
        const envelope = Math.exp(-thunderT * 1.5) * (1 - thunderT);
        const thunder = Math.sin(2 * Math.PI * thunderFreq * t) * envelope * 0.7;
        
        leftSample += thunder;
        rightSample += thunder * 0.8; // Slightly different in right channel
      }
      
      leftChannel[i] = leftSample + rainNoise;
      rightChannel[i] = rightSample + rainNoise;
    }
    
    return buffer;
  };

  const generateOceanGentle = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      
      // Multiple wave layers with different frequencies
      const wave1 = Math.sin(2 * Math.PI * 0.08 * t) * 0.4;
      const wave2 = Math.sin(2 * Math.PI * 0.12 * t) * 0.3;
      const wave3 = Math.sin(2 * Math.PI * 0.05 * t) * 0.2;
      
      // Foam and bubbles
      const foam = (Math.random() * 2 - 1) * 0.15 * Math.abs(wave1);
      
      // Distant seagulls occasionally
      let seagull = 0;
      if (Math.random() < 0.0001) {
        const seagullFreq = 800 + Math.random() * 600;
        const seagullLength = 0.3;
        const seagullT = (t % seagullLength) / seagullLength;
        const envelope = Math.sin(Math.PI * seagullT) * Math.exp(-seagullT * 2);
        seagull = Math.sin(2 * Math.PI * seagullFreq * t) * envelope * 0.1;
      }
      
      const sample = wave1 + wave2 + wave3 + foam + seagull;
      leftChannel[i] = sample;
      rightChannel[i] = sample * 0.95; // Slight stereo difference
    }
    
    return buffer;
  };

  const generateOceanStrong = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      
      // Powerful wave layers
      const wave1 = Math.sin(2 * Math.PI * 0.06 * t) * 0.6;
      const wave2 = Math.sin(2 * Math.PI * 0.1 * t) * 0.5;
      const wave3 = Math.sin(2 * Math.PI * 0.15 * t) * 0.4;
      
      // Crash and foam
      const crash = (Math.random() * 2 - 1) * 0.3 * Math.abs(wave1 + wave2);
      
      // Underwater rumble
      const rumble = Math.sin(2 * Math.PI * 0.02 * t) * 0.2;
      
      const sample = wave1 + wave2 + wave3 + crash + rumble;
      leftChannel[i] = sample;
      rightChannel[i] = sample * 0.9;
    }
    
    return buffer;
  };

  const generateFireplace = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let leftSample = 0;
      let rightSample = 0;
      
      // Base fire hum with multiple harmonics
      const baseHum = Math.sin(2 * Math.PI * 60 * t) * 0.08 +
                     Math.sin(2 * Math.PI * 120 * t) * 0.05 +
                     Math.sin(2 * Math.PI * 180 * t) * 0.03;
      
      // Random crackling sounds
      if (Math.random() < 0.008) {
        const crackleFreq = 300 + Math.random() * 1000;
        const crackleLength = 0.1 + Math.random() * 0.2;
        const crackleT = (i % (audioContext.sampleRate * crackleLength)) / audioContext.sampleRate;
        const envelope = Math.exp(-crackleT * 8) * (1 - Math.pow(crackleT / crackleLength, 2));
        const crackle = Math.sin(2 * Math.PI * crackleFreq * crackleT) * envelope * 0.4;
        
        const pan = Math.random() * 2 - 1;
        leftSample += crackle * Math.max(0, 1 - pan);
        rightSample += crackle * Math.max(0, 1 + pan);
      }
      
      // Wood popping sounds
      if (Math.random() < 0.0015) {
        const popIntensity = 0.3 + Math.random() * 0.4;
        const popLength = 0.05;
        const popT = (i % (audioContext.sampleRate * popLength)) / audioContext.sampleRate;
        const popEnvelope = Math.exp(-popT * 15);
        const pop = (Math.random() * 2 - 1) * popIntensity * popEnvelope;
        
        const pan = Math.random() * 2 - 1;
        leftSample += pop * Math.max(0, 1 - pan);
        rightSample += pop * Math.max(0, 1 + pan);
      }
      
      // Ember settling
      const emberNoise = (Math.random() * 2 - 1) * 0.08;
      
      leftChannel[i] = leftSample + baseHum + emberNoise;
      rightChannel[i] = rightSample + baseHum + emberNoise;
    }
    
    return buffer;
  };

  const generateCampfire = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let leftSample = 0;
      let rightSample = 0;
      
      // Outdoor fire characteristics - more wind influence
      const windInfluence = Math.sin(t * 0.3) * 0.1;
      const baseHum = Math.sin(2 * Math.PI * (80 + windInfluence * 20) * t) * 0.1;
      
      // More frequent crackling due to outdoor conditions
      if (Math.random() < 0.012) {
        const crackleFreq = 200 + Math.random() * 800;
        const crackleLength = 0.08 + Math.random() * 0.15;
        const crackleT = (i % (audioContext.sampleRate * crackleLength)) / audioContext.sampleRate;
        const envelope = Math.exp(-crackleT * 10);
        const crackle = Math.sin(2 * Math.PI * crackleFreq * crackleT) * envelope * 0.5;
        
        const pan = Math.random() * 2 - 1;
        leftSample += crackle * Math.max(0, 1 - pan);
        rightSample += crackle * Math.max(0, 1 + pan);
      }
      
      // Wood burning and settling
      const burningNoise = (Math.random() * 2 - 1) * 0.12;
      
      leftChannel[i] = leftSample + baseHum + burningNoise + windInfluence;
      rightChannel[i] = rightSample + baseHum + burningNoise + windInfluence * 0.8;
    }
    
    return buffer;
  };

  const generateForestWind = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      
      // Wind through trees with varying intensity
      const windBase = Math.sin(2 * Math.PI * 0.1 * t) * 0.4;
      const windVariation = Math.sin(2 * Math.PI * 0.05 * t) * 0.3;
      const windGust = Math.sin(2 * Math.PI * 0.02 * t) * 0.2;
      
      // Leaves rustling
      const rustling = (Math.random() * 2 - 1) * 0.15 * Math.abs(windBase);
      
      // Branch movement
      let branchCreak = 0;
      if (Math.random() < 0.0005) {
        const creakFreq = 100 + Math.random() * 200;
        const creakLength = 0.5;
        const creakT = (t % creakLength) / creakLength;
        const envelope = Math.sin(Math.PI * creakT) * 0.1;
        branchCreak = Math.sin(2 * Math.PI * creakFreq * t) * envelope;
      }
      
      const sample = windBase + windVariation + windGust + rustling + branchCreak;
      leftChannel[i] = sample;
      rightChannel[i] = sample * 0.85 + rustling * 0.3; // Different rustling in each channel
    }
    
    return buffer;
  };

  const generateForestBirds = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Define different bird types with their characteristics
    const birdTypes = [
      { baseFreq: 1200, range: 400, chirpLength: 0.15, probability: 0.003 },
      { baseFreq: 800, range: 300, chirpLength: 0.3, probability: 0.002 },
      { baseFreq: 2000, range: 600, chirpLength: 0.1, probability: 0.0025 },
      { baseFreq: 600, range: 200, chirpLength: 0.4, probability: 0.0015 }
    ];
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let leftSample = 0;
      let rightSample = 0;
      
      // Generate different bird chirps
      birdTypes.forEach(bird => {
        if (Math.random() < bird.probability) {
          const frequency = bird.baseFreq + (Math.random() - 0.5) * bird.range;
          const chirpT = (t % bird.chirpLength) / bird.chirpLength;
          const envelope = Math.sin(Math.PI * chirpT) * Math.exp(-chirpT * 3);
          const vibrato = 1 + Math.sin(2 * Math.PI * 8 * t) * 0.1; // Natural vibrato
          const chirp = Math.sin(2 * Math.PI * frequency * vibrato * t) * envelope * 0.3;
          
          // Spatial positioning
          const pan = Math.random() * 2 - 1;
          const distance = 0.3 + Math.random() * 0.7; // Distance affects volume
          
          leftSample += chirp * Math.max(0, 1 - pan) * distance;
          rightSample += chirp * Math.max(0, 1 + pan) * distance;
        }
      });
      
      // Forest ambiance
      const ambiance = (Math.random() * 2 - 1) * 0.05;
      
      leftChannel[i] = leftSample + ambiance;
      rightChannel[i] = rightSample + ambiance;
    }
    
    return buffer;
  };

  // Generate white noise with better quality
  const generateWhiteNoise = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      // Generate uncorrelated noise for each channel
      leftChannel[i] = (Math.random() * 2 - 1) * 0.7;
      rightChannel[i] = (Math.random() * 2 - 1) * 0.7;
    }
    
    return buffer;
  };

  // Generate pink noise with proper filtering
  const generatePinkNoise = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Pink noise filter coefficients
    let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
    let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      
      // Apply pink noise filter to left channel
      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.1538520;
      b3L = 0.86650 * b3L + whiteL * 0.3104856;
      b4L = 0.55000 * b4L + whiteL * 0.5329522;
      b5L = -0.7616 * b5L - whiteL * 0.0168980;
      leftChannel[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.11;
      b6L = whiteL * 0.115926;
      
      // Apply pink noise filter to right channel
      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.1538520;
      b3R = 0.86650 * b3R + whiteR * 0.3104856;
      b4R = 0.55000 * b4R + whiteR * 0.5329522;
      b5R = -0.7616 * b5R - whiteR * 0.0168980;
      rightChannel[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.11;
      b6R = whiteR * 0.115926;
    }
    
    return buffer;
  };

  // Generate brown noise
  const generateBrownNoise = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    let lastOutL = 0;
    let lastOutR = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      
      leftChannel[i] = (lastOutL + (0.02 * whiteL)) / 1.02;
      lastOutL = leftChannel[i];
      leftChannel[i] *= 3.5;
      
      rightChannel[i] = (lastOutR + (0.02 * whiteR)) / 1.02;
      lastOutR = rightChannel[i];
      rightChannel[i] *= 3.5;
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
      case 'rain-roof':
        buffer = generateRainOnRoof(audioContext);
        break;
      case 'thunderstorm':
        buffer = generateThunderstorm(audioContext);
        break;
      case 'ocean-gentle':
        buffer = generateOceanGentle(audioContext);
        break;
      case 'ocean-strong':
        buffer = generateOceanStrong(audioContext);
        break;
      case 'fireplace':
        buffer = generateFireplace(audioContext);
        break;
      case 'campfire':
        buffer = generateCampfire(audioContext);
        break;
      case 'forest-wind':
        buffer = generateForestWind(audioContext);
        break;
      case 'forest-birds':
        buffer = generateForestBirds(audioContext);
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
      default:
        buffer = generateLightRain(audioContext);
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true; // Enable seamless looping
    
    // Apply low-pass filter for warmer sound
    const filter = applyLowPassFilter(audioContext, source, 8000);
    filter.connect(gainNodeRef.current);
    
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
