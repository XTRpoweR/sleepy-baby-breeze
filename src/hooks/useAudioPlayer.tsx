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

  // Helper: simple linear fade-in/out
  const envelope = (i: number, bufferSize: number, duration: number = 0.05) => {
    // 0 < i < duration in seconds
    const fadeSamp = Math.floor(duration * 44100);
    if (i < fadeSamp) return i / fadeSamp;
    if (i > bufferSize - fadeSamp) return (bufferSize - i) / fadeSamp;
    return 1;
  };

  // Improved Light Rain: filtered noise + sporadic "drops" with stereo position
  const generateLightRain = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;

      // Base gentle noise
      let base = (Math.random() * 2 - 1) * 0.07;

      // Simulate occasional drops (as very short, higher amplitude blips at random pan)
      let drop = 0;
      if (Math.random() < 0.002) {
        let pan = Math.random(); // 0 = left, 1 = right
        let env = Math.exp(-((i % 200) / 200) * 5);
        drop = env * (0.3 + Math.random() * 0.07) * envelope(i, bufferSize, 0.01);
        L[i] += drop * (1 - pan);
        R[i] += drop * pan;
      }

      // Stereo gentle variation
      L[i] += base + Math.sin(t * 0.2) * 0.04;
      R[i] += base + Math.sin(t * 0.23 + 1) * 0.04;
    }
    return buffer;
  };

  // Improved Heavy Rain: louder filtered noise and more "splash" events
  const generateHeavyRain = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      let heavy = (Math.random() * 2 - 1) * 0.19;
      let splash = 0;
      if (Math.random() < 0.008) {
        let pan = Math.random();
        let env = Math.exp(-((i % 100) / 100) * 4);
        splash = env * (0.22 + Math.random() * 0.18) * envelope(i, bufferSize, 0.008);
        L[i] += splash * (1 - pan);
        R[i] += splash * pan;
      }
      // Louder, denser
      L[i] += heavy + Math.sin(t * 0.1) * 0.09;
      R[i] += heavy + Math.sin(t * 0.13 + 0.7) * 0.09;
    }
    return buffer;
  };

  // Improved Rain On Roof: sharper droplet impacts & soft background
  const generateRainOnRoof = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      let roof = (Math.random() * 2 - 1) * 0.06; // Soft base
      if (Math.random() < 0.0025) {
        // Roof hit: high-freq burst
        for (let j = 0; j < 30; j++) {
          if (i + j < bufferSize) {
            let env = Math.exp(-j / 12);
            let pan = Math.random();
            L[i + j] += env * 0.36 * (1 - pan);
            R[i + j] += env * 0.36 * pan;
          }
        }
      }
      L[i] += roof;
      R[i] += roof;
    }
    return buffer;
  };

  // Improved Thunderstorm: occasional deep rumbles, more heavy rain
  const generateThunderstorm = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);
    let thunderAt = Math.floor(Math.random() * (bufferSize - audioContext.sampleRate * 4)); // place 1 thunder

    for (let i = 0; i < bufferSize; i++) {
      let t = i / audioContext.sampleRate;
      let rain = (Math.random() * 2 - 1) * 0.16;
      // thunder: a burst somewhere randomly in the buffer
      if (i > thunderAt && i < thunderAt + audioContext.sampleRate * 4) {
        let n = i - thunderAt;
        let env = Math.exp(-n / (audioContext.sampleRate * 1.7));
        let freq = 23 + Math.random() * 18;
        let th = Math.sin(2 * Math.PI * freq * n / audioContext.sampleRate) * env * 0.41;
        L[i] += th;
        R[i] += th * 0.94;
      }
      L[i] += rain;
      R[i] += rain;
    }
    return buffer;
  };

  // Improved Ocean Gentle: low frequency undulating, with foamy texture
  const generateOceanGentle = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      let t = i / audioContext.sampleRate;
      // Waves are low-freq oscillator plus some filtered noise
      let wave = Math.sin(2 * Math.PI * 0.13 * t) * 0.26 + Math.sin(2 * Math.PI * 0.09 * t) * 0.18;
      let foam = (Math.random() * 2 - 1) * 0.055 * (0.6 + 0.4 * Math.abs(Math.sin(2 * Math.PI * 0.11 * t)));
      // Soft stereo drift
      L[i] += wave + foam + Math.sin(t * 0.6) * 0.012;
      R[i] += wave + foam + Math.sin(t * 0.62 + 1) * 0.012;
    }
    return buffer;
  };

  // Improved Ocean Strong: higher waves and more pronounced crash bursts
  const generateOceanStrong = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      let t = i / audioContext.sampleRate;
      let wave = Math.sin(2 * Math.PI * 0.07 * t) * 0.31 + Math.sin(2 * Math.PI * 0.095 * t) * 0.24;
      let foam = (Math.random() * 2 - 1) * 0.13;
      // Occasional strong crash
      if (Math.random() < 0.0007) {
        let crashLen = 600 + Math.random() * 500;
        for (let j = 0; j < crashLen; j++) {
          if (i + j < bufferSize) {
            let env = Math.exp(-j / 250);
            let pan = Math.random();
            L[i + j] += env * 0.22 * (1 - pan);
            R[i + j] += env * 0.22 * pan;
          }
        }
      }
      L[i] += wave + foam;
      R[i] += wave + foam;
    }
    return buffer;
  };

  // Improved Fire: short crackle bursts + low rumble
  const generateFireplace = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      let t = i / audioContext.sampleRate;
      let hum = Math.sin(2 * Math.PI * 48 * t) * 0.017;
      let crackle = 0;

      if (Math.random() < 0.003) {
        // quick crackle as short envelope burst
        let len = 30 + Math.floor(Math.random() * 60);
        let pan = Math.random();
        for (let j = 0; j < len; j++) {
          if (i + j < bufferSize) {
            let env = Math.exp(-j / 10);
            let c = (Math.random() * 2 - 1) * 0.19 * env;
            L[i + j] += c * (1 - pan);
            R[i + j] += c * pan;
          }
        }
      }
      // Background ember noise
      let ember = (Math.random() * 2 - 1) * 0.012;
      L[i] += hum + ember + crackle;
      R[i] += hum + ember + crackle;
    }
    return buffer;
  };

  // Improved Campfire: slightly windier, more crackle
  const generateCampfire = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      let t = i / audioContext.sampleRate;
      let windy = Math.sin(t * 0.3) * 0.039;
      let crackle = 0;

      if (Math.random() < 0.006) { // more frequent
        let len = 14 + Math.floor(Math.random() * 30);
        let pan = Math.random();
        for (let j = 0; j < len; j++) {
          if (i + j < bufferSize) {
            let env = Math.exp(-j / 9);
            let c = (Math.random() * 2 - 1) * 0.16 * env;
            L[i + j] += c * (1 - pan);
            R[i + j] += c * pan;
          }
        }
      }
      let ember = (Math.random() * 2 - 1) * 0.013;
      L[i] += windy + ember + crackle;
      R[i] += windy + ember + crackle;
    }
    return buffer;
  };

  // Improved Forest Wind: smooth filter-swept noise
  const generateForestWind = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      let t = i / audioContext.sampleRate;
      let wind = (Math.random() * 2 - 1) * (0.14 + 0.09 * Math.sin(0.025 * i));
      let sway = Math.sin(t * 0.09) * 0.09;
      let rustle = (Math.random() * 2 - 1) * 0.06 * Math.abs(sway);
      L[i] += wind + sway + rustle;
      R[i] += wind + sway * 0.7 + rustle * 0.8;
    }
    return buffer;
  };

  // Improved Forest Birds: chirp FM bursts
  const generateForestBirds = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      let t = i / audioContext.sampleRate;
      // Many random short chirps (FM burst hooked to random panning & freq)
      if (Math.random() < 0.0012) {
        let chirpFreq = 900 + Math.random() * 1400;
        let chirpLen = 130 + Math.floor(Math.random() * 170);
        let pan = Math.random();
        for (let j = 0; j < chirpLen; j++) {
          if (i + j < bufferSize) {
            let env = Math.exp(-j / 24);
            let chirp = Math.sin(2 * Math.PI * chirpFreq * (j / audioContext.sampleRate) + 4 * Math.sin(2 * Math.PI * 17 * (j / audioContext.sampleRate)));
            chirp *= env * 0.16;
            L[i + j] += chirp * (1 - pan);
            R[i + j] += chirp * pan;
          }
        }
      }
      // Distant trees/ambiance
      let bg = (Math.random() * 2 - 1) * 0.01;
      L[i] += bg;
      R[i] += bg;
    }
    return buffer;
  };

  // --- HIGHER QUALITY NOISE GENERATORS ---

  // White noise, normalize to avoid blowing out ears
  const generateWhiteNoise = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);
    for (let i = 0; i < bufferSize; i++) {
      L[i] = (Math.random() * 2 - 1) * 0.23;
      R[i] = (Math.random() * 2 - 1) * 0.23;
    }
    return buffer;
  };

  // Pink noise with better filtering and kept low
  const generatePinkNoise = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);
    let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
    let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1, whiteR = Math.random() * 2 - 1;
      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.1538520;
      b3L = 0.86650 * b3L + whiteL * 0.3104856;
      b4L = 0.55000 * b4L + whiteL * 0.5329522;
      b5L = -0.7616 * b5L - whiteL * 0.0168980;
      L[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.035;
      b6L = whiteL * 0.115926;
      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.1538520;
      b3R = 0.86650 * b3R + whiteR * 0.3104856;
      b4R = 0.55000 * b4R + whiteR * 0.5329522;
      b5R = -0.7616 * b5R - whiteR * 0.0168980;
      R[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.035;
      b6R = whiteR * 0.115926;
    }
    return buffer;
  };

  // Brown noise, very mellow, not too loud
  const generateBrownNoise = (audioContext: AudioContext, duration: number = 20) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);
    let lastOutL = 0, lastOutR = 0;
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      L[i] = (lastOutL + 0.02 * whiteL) / 1.02;
      lastOutL = L[i]; L[i] *= 0.21;
      R[i] = (lastOutR + 0.02 * whiteR) / 1.02;
      lastOutR = R[i]; R[i] *= 0.21;
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
    source.loop = true;

    // Slight lowpass filter for warmth (works for all)
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 7000;
    filter.Q.value = 0.8;
    source.connect(filter);
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
