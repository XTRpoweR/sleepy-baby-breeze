
import { useState, useRef, useCallback, TouchEvent } from 'react';

interface SwipeGestureConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export const useSwipeGesture = (config: SwipeGestureConfig) => {
  const [isSwipingLeft, setIsSwipingLeft] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const threshold = config.threshold || 100;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    currentXRef.current = touch.clientX;
    isDraggingRef.current = true;
    config.onSwipeStart?.();
  }, [config]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const touch = e.touches[0];
    currentXRef.current = touch.clientX;
    const deltaX = startXRef.current - currentXRef.current;
    
    if (deltaX > 0) {
      // Swiping left
      setIsSwipingLeft(true);
      const progress = Math.min(deltaX / threshold, 1);
      setSwipeProgress(progress);
    } else {
      // Swiping right or not swiping
      setIsSwipingLeft(false);
      setSwipeProgress(0);
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    const deltaX = startXRef.current - currentXRef.current;
    
    if (deltaX > threshold) {
      config.onSwipeLeft?.();
    } else if (deltaX < -threshold) {
      config.onSwipeRight?.();
    }
    
    // Reset state
    isDraggingRef.current = false;
    setIsSwipingLeft(false);
    setSwipeProgress(0);
    config.onSwipeEnd?.();
  }, [threshold, config]);

  const resetSwipe = useCallback(() => {
    setIsSwipingLeft(false);
    setSwipeProgress(0);
    isDraggingRef.current = false;
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isSwipingLeft,
    swipeProgress,
    resetSwipe,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }
  };
};
