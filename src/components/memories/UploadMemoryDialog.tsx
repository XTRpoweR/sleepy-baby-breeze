import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Upload, X, Image, Video, Camera, Square, Loader2, AlertCircle, SwitchCamera, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useCamera } from '@/hooks/useCamera';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [fileSizeWarning, setFileSizeWarning] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isLoading: cameraLoading,
    error: cameraError,
    isActive: cameraActive,
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
  } = useCamera();

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setTakenAt('');
    setUploading(false);
    setDragOver(false);
    setShowCamera(false);
    setFileSizeWarning('');
    stopCamera();
  };

  const handleClose = () => {
    if (!uploading && !isRecording) {
      resetForm();
      onClose();
    }
  };

  const checkFileSize = (selectedFile: File) => {
    const sizeInMB = selectedFile.size / (1024 * 1024);
    
    if (sizeInMB > 50) {
      setFileSizeWarning(`File size is ${sizeInMB.toFixed(1)}MB which may be too large for upload. Consider using a smaller file.`);
    } else if (sizeInMB > 10) {
      setFileSizeWarning(`File size is ${sizeInMB.toFixed(1)}MB. Large files may take longer to upload.`);
    } else {
      setFileSizeWarning('');
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      checkFileSize(selectedFile);
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

  const handleStartCamera = async () => {
    try {
      setShowCamera(true);
      await startCamera('environment'); // Start with back camera for better photos
    } catch (error) {
      console.error('Failed to start camera:', error);
      setShowCamera(false);
    }
  };

  const handleCapturePhoto = async () => {
    const photoFile = await capturePhoto();
    if (photoFile) {
      setFile(photoFile);
      checkFileSize(photoFile);
      setTitle(`Photo ${format(new Date(), 'MMM d, yyyy')}`);
      setShowCamera(false);
      stopCamera();
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    const videoFile = await stopRecording();
    if (videoFile) {
      setFile(videoFile);
      checkFileSize(videoFile);
      setTitle(`Video ${format(new Date(), 'MMM d, yyyy')}`);
      setShowCamera(false);
      stopCamera();
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-gradient">Camera</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="space-y-4">
              {cameraError ? (
                <div className="text-center p-8 space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                  <div className="text-destructive font-medium">Camera Error</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">{cameraError}</div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => startCamera('environment')}
                      className="hover:bg-primary/10"
                      disabled={cameraLoading}
                    >
                      {cameraLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Try Again
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowCamera(false);
                        stopCamera();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    {(cameraLoading || !cameraActive) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <div className="text-center space-y-2">
                          <Loader2 className="h-8 w-8 text-white animate-spin mx-auto" />
                          <p className="text-white text-sm">
                            {cameraLoading ? 'Starting camera...' : 'Initializing...'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ display: cameraActive ? 'block' : 'none' }}
                    />
                    
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {isRecording && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        REC {formatTime(recordingTime)}
                      </div>
                    )}
                    
                    {capabilities?.hasFrontCamera && capabilities?.hasBackCamera && cameraActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={switchCamera}
                        disabled={isRecording || cameraLoading}
                        className="absolute top-4 right-4 bg-black/50 border-white/20 text-white hover:bg-black/70"
                      >
                        <SwitchCamera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {cameraActive && (
                    <div className="flex justify-center space-x-3">
                      <Button
                        onClick={handleCapturePhoto}
                        disabled={isRecording || cameraLoading}
                        variant="gradient"
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      
                      {!isRecording ? (
                        <Button
                          onClick={handleStartRecording}
                          disabled={cameraLoading}
                          className="bg-red-500 hover:bg-red-600 text-white flex-1"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Record Video
                        </Button>
                      ) : (
                        <Button
                          onClick={handleStopRecording}
                          className="bg-gray-600 hover:bg-gray-700 text-white flex-1"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop ({formatTime(recordingTime)})
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setShowCamera(false);
                  stopCamera();
                }}
                className="w-full"
                disabled={isRecording}
              >
                {isRecording ? 'Stop recording first' : 'Cancel'}
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-gradient">Add Memory for {babyName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-4">
            {/* File size warning */}
            {fileSizeWarning && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>{fileSizeWarning}</AlertDescription>
              </Alert>
            )}

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                dragOver 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
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
                    {isImage && <Image className="h-12 w-12 text-primary animate-fade-in" />}
                    {isVideo && <Video className="h-12 w-12 text-secondary animate-fade-in" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {isImage ? 'Photo' : 'Video'} • {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setFileSizeWarning('');
                    }}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto animate-fade-in" />
                  <div>
                    <p className="font-medium text-foreground">Drop files here or choose an option</p>
                    <p className="text-sm text-muted-foreground">Photos and videos up to 10MB recommended</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" asChild className="flex-1 hover:bg-primary/10">
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
                      variant="gradient"
                      onClick={handleStartCamera}
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-medium">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this memory a title..."
                maxLength={100}
                className="border-primary/20 focus:border-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-medium">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description or note about this memory..."
                rows={3}
                maxLength={500}
                className="border-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* Date Taken */}
            <div className="space-y-2">
              <Label htmlFor="takenAt" className="text-foreground font-medium">Date Taken (optional)</Label>
              <div className="relative">
                <Input
                  id="takenAt"
                  type="datetime-local"
                  value={takenAt}
                  onChange={(e) => setTakenAt(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  className="border-primary/20 focus:border-primary"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={uploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                variant="gradient"
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Memory'
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
