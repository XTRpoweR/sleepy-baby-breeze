import { useState, useEffect, useCallback } from 'react';

interface ActiveSleepSession {
  babyId: string;
  startTime: string; // ISO timestamp
  sleepType: 'nap' | 'night';
  notes?: string;
}

const STORAGE_KEY = 'activeSleepSession';

export const usePersistentSleepSession = (currentBabyId: string) => {
  const [activeSession, setActiveSession] = useState<ActiveSleepSession | null>(null);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');

  // Load active session from localStorage on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session: ActiveSleepSession = JSON.parse(stored);
          // Only load if it belongs to the current baby
          if (session.babyId === currentBabyId) {
            setActiveSession(session);
          } else {
            // Clear if it's for a different baby
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load sleep session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadSession();
  }, [currentBabyId]);

  // Update timer display every second
  useEffect(() => {
    if (!activeSession) {
      setTimerDisplay('00:00:00');
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(activeSession.startTime);
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimerDisplay(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            const session: ActiveSleepSession = JSON.parse(e.newValue);
            if (session.babyId === currentBabyId) {
              setActiveSession(session);
            }
          } catch (error) {
            console.error('Failed to parse storage event:', error);
          }
        } else {
          setActiveSession(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentBabyId]);

  const startSession = useCallback((sleepType: 'nap' | 'night', notes?: string) => {
    const session: ActiveSleepSession = {
      babyId: currentBabyId,
      startTime: new Date().toISOString(),
      sleepType,
      notes,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setActiveSession(session);
  }, [currentBabyId]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveSession(null);
  }, []);

  const getDuration = useCallback((): number => {
    if (!activeSession) return 0;
    const startTime = new Date(activeSession.startTime);
    const now = new Date();
    return Math.round((now.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
  }, [activeSession]);

  return {
    activeSession,
    isActive: !!activeSession,
    timerDisplay,
    startSession,
    clearSession,
    getDuration,
  };
};
