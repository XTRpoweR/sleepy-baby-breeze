
import React, { ReactNode } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: ReactNode;
  onDelete: () => void;
  onDeleteCancel?: () => void;
  isDeleting?: boolean;
  deleteLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard = ({
  children,
  onDelete,
  onDeleteCancel,
  isDeleting = false,
  deleteLabel = "Delete",
  className,
  disabled = false
}: SwipeableCardProps) => {
  const {
    swipeHandlers,
    isSwipingLeft,
    swipeProgress,
    resetSwipe
  } = useSwipeGesture({
    threshold: 120,
    onSwipeLeft: () => {
      if (!disabled && !isDeleting) {
        onDelete();
      }
    },
    onSwipeRight: () => {
      if (onDeleteCancel) {
        onDeleteCancel();
      }
    }
  });

  const translateX = isSwipingLeft ? -swipeProgress * 120 : 0;
  const deleteOpacity = swipeProgress;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Delete action background */}
      <div 
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white transition-all duration-200"
        style={{
          width: `${Math.max(swipeProgress * 120, 0)}px`,
          opacity: deleteOpacity,
        }}
      >
        <div className="flex items-center space-x-2 px-4">
          <Trash2 className="h-5 w-5" />
          <span className="text-sm font-medium whitespace-nowrap">
            {swipeProgress > 0.7 ? "Release to Delete" : deleteLabel}
          </span>
        </div>
      </div>

      {/* Main card content */}
      <div
        className={cn(
          "relative transition-transform duration-200 touch-pan-y",
          isDeleting && "opacity-50 pointer-events-none"
        )}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        {...(!disabled ? swipeHandlers : {})}
      >
        {children}
      </div>

      {/* Cancel swipe button */}
      {isSwipingLeft && swipeProgress > 0.3 && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            resetSwipe();
            onDeleteCancel?.();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
