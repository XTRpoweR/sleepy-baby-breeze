
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCamera } from '@/hooks/useCamera';

interface PhotoUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  fallbackText?: string;
  className?: string;
}

export const PhotoUpload = ({ value, onChange, fallbackText = 'B', className }: PhotoUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the new camera hook instead of managing camera manually
  const {
    isLoading: cameraLoading,
    error: cameraError,
    isActive: showCamera,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto
  } = useCamera();

  const uploadFile = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(data.path);

      onChange(publicUrl);
      toast({
        title: "Success!",
        description: "Photo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      uploadFile(file);
    }
  };

  const handleCapturePhoto = async () => {
    const photoFile = await capturePhoto();
    if (photoFile) {
      await uploadFile(photoFile);
      stopCamera();
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removePhoto = () => {
    onChange(null);
  };

  if (showCamera) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          {cameraError ? (
            <div className="text-center p-8 space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div className="text-destructive font-medium">Camera Error</div>
              <div className="text-sm text-muted-foreground">{cameraError}</div>
              <Button
                variant="outline"
                onClick={() => startCamera('environment')}
                disabled={cameraLoading}
              >
                {cameraLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
                {cameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ 
                    transform: 'scaleX(-1)',
                    backgroundColor: 'black'
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  onClick={handleCapturePhoto} 
                  className="flex-1" 
                  disabled={isUploading || cameraLoading}
                  variant="gradient"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Capture'}
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-4">
        {value ? (
          <div className="relative inline-block">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={value} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {fallbackText}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={removePhoto}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Card
            className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="p-6 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-fade-in" />
              <p className="text-foreground mb-2">Drag & drop or click to upload</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 hover:bg-primary/10"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload File'
            )}
          </Button>
          <Button
            variant="gradient"
            onClick={() => startCamera('environment')}
            disabled={isUploading || cameraLoading}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            {cameraLoading ? 'Starting...' : 'Take Photo'}
          </Button>
        </div>
      </div>
    </div>
  );
};
