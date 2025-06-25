
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Upload, X, Image, Video, Camera, Square, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface UploadMemoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, title?: string, description?: string, takenAt?: Date) => Promise<boolean>;
  babyName: string;
}

export const UploadMemoryDialog = ({ isOpen, onClose, onUpload, babyName }: UploadMemoryDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setTakenAt('');
    setUploading(false);
    setDragOver(false);
    stopCamera();
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setCameraLoading(true);
    setCameraReady(false);
    console.log('Starting camera initialization...');
    
    try {
      // Try multiple constraint configurations for better compatibility
      const constraintOptions = [
        {
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: true
        },
        {
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: true
        },
        {
          video: { facingMode: 'user' },
          audio: true
        },
        {
          video: true,
          audio: true
        }
      ];

      let stream: MediaStream | null = null;
      
      for (let i = 0; i < constraintOptions.length; i++) {
        try {
          console.log(`Trying camera constraints ${i + 1}:`, constraintOptions[i]);
          stream = await navigator.mediaDevices.getUserMedia(constraintOptions[i]);
          console.log('Camera stream obtained successfully');
          break;
        } catch (err) {
          console.log(`Constraint ${i + 1} failed:`, err);
          if (i === constraintOptions.length - 1) {
            throw err;
          }
        }
      }

      if (!stream) {
        throw new Error('Failed to get camera stream');
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for the video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          const video = videoRef.current;
          
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded:', {
              width: video.videoWidth,
              height: video.videoHeight,
              duration: video.duration
            });
            resolve();
          };

          const onError = (error: Event) => {
            console.error('Video error:', error);
            reject(new Error('Failed to load video'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
          video.addEventListener('error', onError, { once: true });

          // Cleanup function
          setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Video loading timeout'));
          }, 5000);
        });
        
        // Play the video
        try {
          await videoRef.current.play();
          console.log('Video is now playing');
          setCameraReady(true);
          setShowCamera(true);
        } catch (playError) {
          console.error('Failed to play video:', playError);
          throw new Error('Failed to start video playback');
        }
      }
      
    } catch (error) {
      console.error('Camera initialization failed:', error);
      let errorMessage = 'Could not access camera. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permissions and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Camera not supported in this browser.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Camera is being used by another application.';
        } else {
          errorMessage += error.message;
        }
      }
      
      setCameraError(errorMessage);
      stopCamera();
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    setShowCamera(false);
    setIsRecording(false);
    setRecordingTime(0);
    setCameraError(null);
    setCameraLoading(false);
    setCameraReady(false);
    recordedChunksRef.current = [];
  };

  const capturePhoto = () => {
    console.log('Capturing photo...');
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      setCameraError('Camera not ready for photo capture');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video dimensions are zero');
      setCameraError('Camera video not ready');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      setCameraError('Failed to prepare photo capture');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('Capturing with dimensions:', canvas.width, 'x', canvas.height);
    
    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('Photo captured successfully, size:', blob.size);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `photo-${timestamp}.jpg`, { type: 'image/jpeg' });
        setFile(file);
        setTitle('Camera Photo');
        stopCamera();
      } else {
        console.error('Failed to create blob from canvas');
        setCameraError('Failed to save photo');
      }
    }, 'image/jpeg', 0.9);
  };

  const startRecording = () => {
    console.log('Starting video recording...');
    
    if (!streamRef.current) {
      console.error('No stream available for recording');
      setCameraError('Camera stream not available');
      return;
    }

    recordedChunksRef.current = [];

    try {
      // Try different mime types for better browser compatibility
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      
      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      if (!mimeType) {
        throw new Error('No supported video format found');
      }
      
      console.log('Using mime type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: mimeType
      });
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Recording data available, size:', event.data.size);
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, total chunks:', recordedChunksRef.current.length);
        
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          console.log('Created video blob, size:', blob.size);
          
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const file = new File([blob], `video-${timestamp}.${extension}`, { type: mimeType });
          
          setFile(file);
          setTitle('Recorded Video');
          stopCamera();
        } else {
          console.error('No recorded data available');
          setCameraError('Recording failed - no data captured');
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setCameraError('Recording failed');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      setCameraError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const takenAtDate = takenAt ? new Date(takenAt) : undefined;
    const success = await onUpload(file, title.trim() || undefined, description.trim() || undefined, takenAtDate);
    
    if (success) {
      handleClose();
    }
    setUploading(false);
  };

  const isVideo = file?.type.startsWith('video/');
  const isImage = file?.type.startsWith('image/');

  if (showCamera) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Camera</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {cameraLoading ? (
              <div className="text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Initializing camera...</p>
              </div>
            ) : cameraError ? (
              <div className="text-center p-8">
                <div className="text-red-600 mb-4">{cameraError}</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCameraError(null);
                    startCamera();
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : cameraReady ? (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {isRecording && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      {formatTime(recordingTime)}
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={capturePhoto}
                    disabled={isRecording}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Record Video
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="bg-gray-600 hover:bg-gray-700 flex-1"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Setting up camera...</p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={stopCamera}
              className="w-full"
              disabled={isRecording}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Memory for {babyName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            {file ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  {isImage && <Image className="h-12 w-12 text-blue-600" />}
                  {isVideo && <Video className="h-12 w-12 text-purple-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {isImage ? 'Photo' : 'Video'} • {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-900 font-medium">Drop files here or choose an option</p>
                  <p className="text-sm text-gray-500">Photos and videos</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" asChild className="flex-1">
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) handleFileSelect(selectedFile);
                        }}
                      />
                    </label>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={startCamera}
                    className="flex-1"
                    disabled={cameraLoading}
                  >
                    {cameraLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4 mr-2" />
                    )}
                    Camera
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this memory a title..."
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description or note about this memory..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Date Taken */}
          <div className="space-y-2">
            <Label htmlFor="takenAt">Date Taken (optional)</Label>
            <div className="relative">
              <Input
                id="takenAt"
                type="datetime-local"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Uploading...' : 'Upload Memory'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
