
import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioQuality {
  bitrate: string;
  format: string;
  size: 'high' | 'medium' | 'low';
}

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

interface DeviceCapabilities {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsAdvancedAudio: boolean;
  networkSpeed: 'fast' | 'medium' | 'slow';
  batteryLevel?: number;
}

export const useAudioManager = () => {
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    supportsAdvancedAudio: true,
    networkSpeed: 'fast'
  });

  const [qualitySettings, setQualitySettings] = useState<{
    auto: boolean;
    preferred: 'high' | 'medium' | 'low';
  }>({
    auto: true,
    preferred: 'high'
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const [isAudioContextReady, setIsAudioContextReady] = useState(false);

  // Detect device capabilities
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      
      // Detect network speed (simplified)
      const connection = (navigator as any).connection;
      let networkSpeed: 'fast' | 'medium' | 'slow' = 'fast';
      
      if (connection) {
        if (connection.effectiveType === '2g') networkSpeed = 'slow';
        else if (connection.effectiveType === '3g') networkSpeed = 'medium';
        else networkSpeed = 'fast';
      }

      setDeviceCapabilities({
        isMobile,
        isIOS,
        isAndroid,
        supportsAdvancedAudio: !isMobile || 'AudioContext' in window,
        networkSpeed
      });
    };

    detectDevice();
  }, []);

  // Initialize audio context for mobile
  const initializeAudioContext = useCallback(async () => {
    if (deviceCapabilities.isMobile && !audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setIsAudioContextReady(true);
        console.log('Audio context initialized for mobile device');
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    } else if (!deviceCapabilities.isMobile) {
      setIsAudioContextReady(true);
    }
  }, [deviceCapabilities.isMobile]);

  // Get optimal quality based on device and network
  const getOptimalQuality = useCallback((): 'high' | 'medium' | 'low' => {
    if (!qualitySettings.auto) {
      return qualitySettings.preferred;
    }

    // Auto quality selection logic
    if (deviceCapabilities.isMobile) {
      if (deviceCapabilities.networkSpeed === 'slow') return 'low';
      if (deviceCapabilities.networkSpeed === 'medium') return 'medium';
      return 'medium'; // Conservative for mobile
    }
    
    // Desktop - can handle higher quality
    if (deviceCapabilities.networkSpeed === 'slow') return 'medium';
    return 'high';
  }, [qualitySettings, deviceCapabilities]);

  // Enhanced audio tracks with multiple quality versions
  const audioTracks: AudioTrack[] = [
    {
      id: 'heavy-rain-drops',
      name: 'Heavy Rain Drops',
      category: 'nature',
      subcategory: 'rain',
      urls: {
        high: '/sounds/mixkit-heavy-rain-drops-2399.mp3',
        medium: '/sounds/mixkit-heavy-rain-drops-2399.mp3',
        low: '/sounds/mixkit-heavy-rain-drops-2399.mp3'
      },
      duration: 0,
      description: 'The sound of heavy rain drops for relaxation.'
    },
    {
      id: 'water-fountain-healing',
      name: 'Water Fountain Healing',
      category: 'nature',
      subcategory: 'water',
      urls: {
        high: '/sounds/water-fountain-healing-music-239455.mp3',
        medium: '/sounds/water-fountain-healing-music-239455.mp3',
        low: '/sounds/water-fountain-healing-music-239455.mp3'
      },
      duration: 0,
      description: 'Healing music with a peaceful water fountain.'
    },
    {
      id: 'waves-sad-piano',
      name: 'Waves and Piano',
      category: 'lullaby',
      subcategory: 'music',
      urls: {
        high: '/sounds/waves-and-tears-sad-piano-music-with-calm-ocean-waves-8164.mp3',
        medium: '/sounds/waves-and-tears-sad-piano-music-with-calm-ocean-waves-8164.mp3',
        low: '/sounds/waves-and-tears-sad-piano-music-with-calm-ocean-waves-8164.mp3'
      },
      duration: 0,
      description: 'Calming piano music mixed with gentle ocean waves.'
    },
    {
      id: 'dark-atmosphere-rain',
      name: 'Dark Atmosphere Rain',
      category: 'nature',
      subcategory: 'rain',
      urls: {
        high: '/sounds/dark-atmosphere-with-rain-352570.mp3',
        medium: '/sounds/dark-atmosphere-with-rain-352570.mp3',
        low: '/sounds/dark-atmosphere-with-rain-352570.mp3'
      },
      duration: 0,
      description: 'Deep atmospheric rain sounds for deep relaxation.'
    },
    {
      id: 'nature-investigation',
      name: 'Nature Investigation',
      category: 'nature',
      urls: {
        high: '/sounds/nature-investigation-255161.mp3',
        medium: '/sounds/nature-investigation-255161.mp3',
        low: '/sounds/nature-investigation-255161.mp3'
      },
      duration: 0,
      description: 'Natural ambient sounds for peaceful meditation.'
    },
    {
      id: 'soft-birds-sound',
      name: 'Soft Bird Sounds',
      category: 'nature',
      subcategory: 'birds',
      urls: {
        high: '/sounds/soft-birds-sound-304132.mp3',
        medium: '/sounds/soft-birds-sound-304132.mp3',
        low: '/sounds/soft-birds-sound-304132.mp3'
      },
      duration: 0,
      description: 'Gentle bird chirping for a peaceful atmosphere.'
    }
  ];

  return {
    deviceCapabilities,
    qualitySettings,
    audioTracks,
    isAudioContextReady,
    getOptimalQuality,
    initializeAudioContext,
    setQualitySettings
  };
};
