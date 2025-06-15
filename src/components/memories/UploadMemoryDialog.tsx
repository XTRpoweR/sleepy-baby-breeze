
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Upload, X, Image, Video } from 'lucide-react';
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

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setTakenAt('');
    setUploading(false);
    setDragOver(false);
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
        // Generate a default title from filename
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
                  <p className="text-gray-900 font-medium">Drop files here or click to upload</p>
                  <p className="text-sm text-gray-500">Photos and videos only</p>
                </div>
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    Choose File
                    <input
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
