
import { useState, useCallback } from 'react';

export const useLazyAudioPlayer = () => {
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<any>(null);

  const loadAudioPlayer = useCallback(async () => {
    if (!isAudioLoaded) {
      try {
        // Dynamically import the audio player only when needed
        const { useAudioPlayer } = await import('./useAudioPlayer');
        setAudioPlayer({ useAudioPlayer });
        setIsAudioLoaded(true);
      } catch (error) {
        console.error('Failed to load audio player:', error);
      }
    }
  }, [isAudioLoaded]);

  return {
    isAudioLoaded,
    audioPlayer,
    loadAudioPlayer
  };
};
