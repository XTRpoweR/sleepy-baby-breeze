
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
  isRecording: boolean;
  recordingTime: number;
  capabilities: CameraCapabilities | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: (facingMode?: 'user' | 'environment') => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<File | null>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<File | null>;
  switchCamera: () => Promise<void>;
}

export const useCamera = (): CameraHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('environment');
  const [capabilities, setCapabilities] = useState<CameraCapabilities | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const checkCameraCapabilities = useCallback(async (): Promise<CameraCapabilities> => {
    const defaultCapabilities: CameraCapabilities = {
      hasCamera: false,
      hasFrontCamera: false,
      hasBackCamera: false,
      supportedConstraints: {}
    };

    if (!navigator.mediaDevices?.getUserMedia) {
      return defaultCapabilities;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
      
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

  const getOptimalConstraints = useCallback((facingMode: 'user' | 'environment') => {
    // Progressive fallback constraints for better compatibility
    return [
      // Best quality with facing mode
      {
        video: {
          facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: true
      },
      // Medium quality with facing mode
      {
        video: {
          facingMode,
          width: { ideal: 854, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 24, max: 30 }
        },
        audio: true
      },
      // Basic quality with facing mode
      {
        video: {
          facingMode,
          width: 640,
          height: 480
        },
        audio: true
      },
      // Fallback without facing mode
      {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        },
        audio: true
      },
      // Last resort - any video
      { video: true, audio: true },
      { video: true }
    ];
  }, []);

  const waitForVideoReady = useCallback((video: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Video ready timeout'));
      }, 10000);

      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        clearTimeout(timeout);
      };

      const onLoadedMetadata = () => {
        console.log('Video metadata loaded:', {
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration
        });
      };

      const onCanPlay = () => {
        console.log('Video can play');
        cleanup();
        resolve();
      };

      const onError = (event: Event) => {
        console.error('Video error:', event);
        cleanup();
        reject(new Error('Video loading failed'));
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);

      // Force a check in case the video is already ready
      if (video.readyState >= 3) { // HAVE_FUTURE_DATA or higher
        cleanup();
        resolve();
      }
    });
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
        throw new Error('No camera device found');
      }

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = getOptimalConstraints(facingMode);
      let stream: MediaStream | null = null;
      let lastError: Error | null = null;

      // Try constraints in order of preference
      for (const constraint of constraints) {
        try {
          console.log('Trying constraint:', constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('Camera access successful with constraint');
          break;
        } catch (err) {
          console.warn('Constraint failed:', constraint, err);
          lastError = err as Error;
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('No suitable camera configuration found');
      }

      // Verify stream has video tracks
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error('No video track in stream');
      }

      console.log('Video track info:', {
        label: videoTracks[0].label,
        settings: videoTracks[0].getSettings(),
        constraints: videoTracks[0].getConstraints()
      });

      streamRef.current = stream;
      setCurrentFacingMode(facingMode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await waitForVideoReady(videoRef.current);
        
        // Start playback
        try {
          await videoRef.current.play();
          console.log('Video playback started successfully');
        } catch (playError) {
          console.warn('Video autoplay failed (but continuing):', playError);
          // Don't throw here - user can manually start playback
        }
      }

      setIsActive(true);
      console.log('Camera started successfully');
    } catch (err) {
      console.error('Camera start error:', err);
      let errorMessage = 'Camera access failed: ';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Camera permission denied. Please allow camera access and try again.';
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
  }, [checkCameraCapabilities, getOptimalConstraints, waitForVideoReady]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
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
    setIsRecording(false);
    setRecordingTime(0);
    setError(null);
    recordedChunksRef.current = [];
  }, [isRecording]);

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
      
      // Convert to blob
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
        }, 'image/jpeg', 0.9);
      });
    } catch (err) {
      console.error('Photo capture error:', err);
      return null;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    if (!streamRef.current) {
      throw new Error('No camera stream available for recording');
    }

    console.log('Starting video recording');
    recordedChunksRef.current = [];

    try {
      // Determine best supported mime type
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus', 
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4;codecs=h264,aac',
        'video/mp4'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Using mime type:', mimeType);
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error('No supported video recording format found');
      }
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log('Recording data chunk:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, total chunks:', recordedChunksRef.current.length);
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Record in 100ms chunks
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('Recording started successfully');
    } catch (err) {
      console.error('Failed to start recording:', err);
      throw new Error('Failed to start video recording');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      console.log('Stopping recording');
      
      const handleStop = () => {
        if (recordedChunksRef.current.length === 0) {
          console.error('No recorded data available');
          resolve(null);
          return;
        }

        const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `video-${timestamp}.${extension}`, { type: mimeType });
        
        console.log('Video file created:', file.name, 'size:', blob.size);
        resolve(file);
      };

      mediaRecorderRef.current.addEventListener('stop', handleStop, { once: true });
      mediaRecorderRef.current.stop();
    });
  }, [isRecording]);

  const switchCamera = useCallback(async (): Promise<void> => {
    if (!isActive) return;
    
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    await startCamera(newFacingMode);
  }, [isActive, currentFacingMode, startCamera]);

  return {
    isLoading,
    error,
    isActive,
    isRecording,
    recordingTime,
    capabilities,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    startRecording,
    stopRecording,
    switchCamera
  };
};
