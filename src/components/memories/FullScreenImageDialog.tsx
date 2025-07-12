
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  X,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface Memory {
  id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: 'photo' | 'video';
  taken_at: string | null;
  created_at: string;
  file_size: number | null;
}

interface FullScreenImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory;
  onDownload: (memory: Memory) => void;
}

export const FullScreenImageDialog = ({ 
  isOpen, 
  onClose, 
  memory, 
  onDownload 
}: FullScreenImageDialogProps) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-none">
        {/* Header with controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(memory)}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white text-sm min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="text-white hover:bg-white/20 text-xs"
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image container */}
        <div 
          className="flex items-center justify-center w-full h-full overflow-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <img
            src={memory.media_url}
            alt={memory.title || 'Memory'}
            className="max-w-none cursor-zoom-in transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (zoom === 1) {
                handleZoomIn();
              }
            }}
          />
        </div>

        {/* Footer with image info */}
        {(memory.title || memory.description) && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="text-center text-white">
              {memory.title && (
                <h3 className="text-lg font-medium mb-1">{memory.title}</h3>
              )}
              {memory.description && (
                <p className="text-sm text-white/80">{memory.description}</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
