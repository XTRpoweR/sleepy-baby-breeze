import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Download, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  MoreVertical,
  FileVideo,
  Image as ImageIcon
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { EditMemoryDialog } from '@/components/memories/EditMemoryDialog';
import { VideoPlayerDialog } from '@/components/memories/VideoPlayerDialog';

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

interface MemoryGridProps {
  memories: Memory[];
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, updates: { title?: string; description?: string; taken_at?: Date | null }) => Promise<boolean>;
  canEdit: boolean;
}

export const MemoryGrid = ({ memories, onDelete, onUpdate, canEdit }: MemoryGridProps) => {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideoMemory, setSelectedVideoMemory] = useState<Memory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const detectVideoFormat = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension;
  };

  const isUnsupportedFormat = (format: string) => {
    const unsupportedFormats = ['mov', 'avi', 'wmv', 'flv', 'mkv'];
    return unsupportedFormats.includes(format || '');
  };

  const handleDownload = async (memory: Memory) => {
    try {
      console.log('Downloading memory:', memory.media_url);
      
      const response = await fetch(memory.media_url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const extension = memory.media_type === 'video' ? 'mp4' : 'jpg';
      const timestamp = memory.taken_at ? 
        format(new Date(memory.taken_at), 'yyyy-MM-dd_HH-mm-ss') : 
        format(new Date(memory.created_at), 'yyyy-MM-dd_HH-mm-ss');
      const filename = memory.title ? 
        `${memory.title.replace(/[^\w\s-]/g, '')}_${timestamp}.${extension}` :
        `memory_${timestamp}.${extension}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      console.log('Download completed:', filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleEdit = (memory: Memory) => {
    setSelectedMemory(memory);
    setShowEditDialog(true);
  };

  const handleDelete = async (memory: Memory) => {
    if (!window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(memory.id);
    try {
      await onDelete(memory.id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleVideoClick = (memory: Memory) => {
    console.log('Video clicked:', memory.title, memory.media_url);
    
    const format = detectVideoFormat(memory.media_url);
    if (format && isUnsupportedFormat(format)) {
      console.warn(`Video format ${format} may not be supported in all browsers`);
    }
    
    setSelectedVideoMemory(memory);
    setShowVideoPlayer(true);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return null;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return null;
    }
  };

  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No memories yet</h3>
        <p className="text-muted-foreground">Upload your first photo or video to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {memories.map((memory) => {
          const videoFormat = memory.media_type === 'video' ? detectVideoFormat(memory.media_url) : null;
          const isVideoUnsupported = videoFormat && isUnsupportedFormat(videoFormat);
          
          return (
            <Card key={memory.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square bg-gradient-to-br from-primary/5 to-secondary/5">
                {memory.media_type === 'photo' ? (
                  <img
                    src={memory.media_url}
                    alt={memory.title || 'Memory'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={memory.media_url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                    />
                    <div 
                      className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors"
                      onClick={() => handleVideoClick(memory)}
                    >
                      <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors">
                        <Play className="h-6 w-6 text-primary fill-primary" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center pointer-events-none">
                      <FileVideo className="h-3 w-3 mr-1" />
                      Video
                      {isVideoUnsupported && (
                        <span className="ml-1 text-yellow-300" title={`${videoFormat?.toUpperCase()} format may need conversion`}>
                          ⚠️
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/90 border-white/20 hover:bg-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(memory)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        {canEdit && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(memory)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(memory)}
                              className="text-destructive focus:text-destructive"
                              disabled={deletingId === memory.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingId === memory.id ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  {memory.title && (
                    <h3 className="font-medium text-foreground line-clamp-2">
                      {memory.title}
                    </h3>
                  )}
                  
                  {memory.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {memory.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDate(memory.taken_at || memory.created_at)}
                      </span>
                    </div>
                    
                    {formatTime(memory.taken_at || memory.created_at) && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatTime(memory.taken_at || memory.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {memory.file_size && (
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(memory.file_size)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {selectedMemory && (
        <EditMemoryDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedMemory(null);
          }}
          memory={selectedMemory}
          onUpdate={onUpdate}
        />
      )}

      {/* Video Player Dialog */}
      {selectedVideoMemory && (
        <VideoPlayerDialog
          isOpen={showVideoPlayer}
          onClose={() => {
            console.log('Closing video player');
            setShowVideoPlayer(false);
            setSelectedVideoMemory(null);
          }}
          videoUrl={selectedVideoMemory.media_url}
          title={selectedVideoMemory.title || undefined}
          description={selectedVideoMemory.description || undefined}
        />
      )}
    </>
  );
};
