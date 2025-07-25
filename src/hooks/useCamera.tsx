
import { useState, useRef, useCallback } from 'react';

interface CameraCapabilities {
  hasCamera: boolean;
  hasFrontCamera: boolean;
  hasBackCamera: boolean;
  supportedConstraints: MediaTrackSupportedConstraints;
}

interface CameraHookReturn {
  isLoading: boolean;
  error: string | null;
  isActive: boolean;
  capabilities: CameraCapabilities | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: (facingMode?: 'user' | 'environment') => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<File | null>;
  switchCamera: () => Promise<void>;
}

export const useCamera = (): CameraHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('environment');
  const [capabilities, setCapabilities] = useState<CameraCapabilities | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkCameraCapabilities = useCallback(async (): Promise<CameraCapabilities> => {
    const defaultCapabilities: CameraCapabilities = {
      hasCamera: false,
      hasFrontCamera: false,
      hasBackCamera: false,
      supportedConstraints: {}
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('Media devices not supported');
      return defaultCapabilities;
    }

    try {
      // First try to get any camera to check basic support
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
      testStream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
      
      console.log('Found video devices:', videoDevices.length);
      
      return {
        hasCamera: videoDevices.length > 0,
        hasFrontCamera: videoDevices.some(device => 
          device.label.toLowerCase().includes('front') || 
          device.label.toLowerCase().includes('user')
        ),
        hasBackCamera: videoDevices.some(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        ),
        supportedConstraints
      };
    } catch (err) {
      console.error('Error checking camera capabilities:', err);
      return defaultCapabilities;
    }
  }, []);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    console.log('Starting camera with facingMode:', facingMode);
    setIsLoading(true);
    setError(null);

    try {
      // Check capabilities first
      const caps = await checkCameraCapabilities();
      setCapabilities(caps);

      if (!caps.hasCamera) {
        throw new Error('No camera device found on this device');
      }

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Try progressively simpler constraints
      const constraints = [
        // Try with facing mode first
        { 
          video: { 
            facingMode: { ideal: facingMode },
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        },
        // Fallback without facing mode
        { 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        },
        // Last resort - any video
        { video: true }
      ];

      let stream: MediaStream | null = null;
      let lastError: Error | null = null;

      for (const constraint of constraints) {
        try {
          console.log('Trying constraint:', constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('Camera access successful');
          break;
        } catch (err) {
          console.warn('Constraint failed:', err);
          lastError = err as Error;
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('Failed to access camera');
      }

      // Verify stream has video tracks
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error('No video track available');
      }

      console.log('Video track info:', {
        label: videoTracks[0].label,
        settings: videoTracks[0].getSettings()
      });

      streamRef.current = stream;
      setCurrentFacingMode(facingMode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for the video to load and start playing
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          
          const cleanup = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('error', onError);
          };

          const onLoadedMetadata = () => {
            console.log('Video metadata loaded');
          };

          const onCanPlay = async () => {
            console.log('Video can play');
            try {
              await video.play();
              console.log('Video started playing');
              cleanup();
              resolve();
            } catch (playError) {
              console.warn('Autoplay failed, but continuing:', playError);
              cleanup();
              resolve(); // Still resolve as the camera is working
            }
          };

          const onError = (event: Event) => {
            console.error('Video error:', event);
            cleanup();
            reject(new Error('Video failed to load'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('canplay', onCanPlay);
          video.addEventListener('error', onError);

          // If video is already ready
          if (video.readyState >= 2) {
            onCanPlay();
          }
        });
      }

      setIsActive(true);
      console.log('Camera started successfully');
    } catch (err) {
      console.error('Camera start error:', err);
      let errorMessage = 'Camera access failed: ';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage += 'Camera not supported in this browser.';
        } else if (err.name === 'NotReadableError') {
          errorMessage += 'Camera is being used by another application.';
        } else {
          errorMessage += err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [checkCameraCapabilities]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
    setError(null);
  }, []);

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      console.error('Video elements not ready for photo capture');
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas size to match video
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      
      console.log('Capturing photo with dimensions:', width, 'x', height);
      
      // Draw current video frame
      ctx.drawImage(video, 0, 0, width, height);
      
      // Convert to blob with compression for smaller file size
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const file = new File([blob], `photo-${timestamp}.jpg`, { type: 'image/jpeg' });
            console.log('Photo captured successfully, size:', blob.size);
            resolve(file);
          } else {
            console.error('Failed to create photo blob');
            resolve(null);
          }
        }, 'image/jpeg', 0.8); // Compress to 80% quality
      });
    } catch (err) {
      console.error('Photo capture error:', err);
      return null;
    }
  }, []);

  const switchCamera = useCallback(async (): Promise<void> => {
    if (!isActive) return;
    
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    await startCamera(newFacingMode);
  }, [isActive, currentFacingMode, startCamera]);

  return {
    isLoading,
    error,
    isActive,
    capabilities,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera
  };
};
