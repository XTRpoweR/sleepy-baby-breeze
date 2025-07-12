import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface VideoPlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  description?: string;
}

export const VideoPlayerDialog = ({ isOpen, onClose, videoUrl, title, description }: VideoPlayerDialogProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log('VideoPlayerDialog isOpen:', isOpen, 'videoUrl:', videoUrl);
  }, [isOpen, videoUrl]);

  const detectVideoFormat = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension;
  };

  const isUnsupportedFormat = (format: string) => {
    const unsupportedFormats = ['mov', 'avi', 'wmv', 'flv', 'mkv'];
    return unsupportedFormats.includes(format || '');
  };

  const convertVideo = async () => {
    setIsConverting(true);
    try {
      const response = await fetch('/api/convert-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Video conversion failed');
      }

      const data = await response.json();
      setConvertedUrl(data.convertedUrl);
      setError(null);
      
      toast({
        title: "Video converted successfully",
        description: "The video has been converted to a compatible format.",
      });
    } catch (error) {
      console.error('Video conversion error:', error);
      toast({
        title: "Conversion failed",
        description: "Unable to convert video. Please try downloading and converting manually.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentVideoUrl = convertedUrl || videoUrl;
    const format = detectVideoFormat(currentVideoUrl);

    const handleLoadedData = () => {
      console.log('Video loaded successfully');
      setIsLoading(false);
      setDuration(video.duration);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setIsLoading(false);
      
      if (format && isUnsupportedFormat(format)) {
        setError(`Unsupported video format: ${format.toUpperCase()}. This format may not play in all browsers.`);
      } else {
        setError('Failed to load video. The file may be corrupted or in an unsupported format.');
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      console.log('Video loading started');
      setIsLoading(true);
      setError(null);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [videoUrl, convertedUrl]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing video:', error);
      toast({
        title: "Playback error",
        description: "Unable to play video. Try converting to a compatible format.",
        variant: "destructive",
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(convertedUrl || videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = title ? `${title}.mp4` : 'video.mp4';
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDialogOpenChange = (open: boolean) => {
    console.log('Dialog open change:', open);
    if (!open) {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
        setIsPlaying(false);
      }
      onClose();
    }
  };

  const currentVideoUrl = convertedUrl || videoUrl;
  const format = detectVideoFormat(currentVideoUrl);
  const showConvertOption = format && isUnsupportedFormat(format) && !convertedUrl;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-semibold">
            {title || 'Video Player'}
          </DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </DialogHeader>

        <div className="px-6 pb-6">
          {error ? (
            <Card className="p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <div className="space-y-3">
                {showConvertOption && (
                  <Button 
                    onClick={convertVideo} 
                    disabled={isConverting}
                    className="mr-2"
                  >
                    {isConverting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Convert to MP4
                      </>
                    )}
                  </Button>
                )}
                <Button onClick={() => handleDialogOpenChange(false)} variant="outline">
                  Close
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={currentVideoUrl}
                  className="w-full aspect-video"
                  preload="metadata"
                  onClick={togglePlay}
                  crossOrigin="anonymous"
                  playsInline
                  controls={false}
                />
                
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white">Loading video...</div>
                  </div>
                )}

                {!isLoading && !error && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-black/20"
                    onClick={togglePlay}
                  >
                    <div className="bg-white/90 rounded-full p-4">
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-primary" />
                      ) : (
                        <Play className="h-8 w-8 text-primary ml-1" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              {!isLoading && !error && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <span>{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={togglePlay}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
