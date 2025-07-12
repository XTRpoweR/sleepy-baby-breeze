
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  MoreVertical,
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter out any video entries that might still exist in the database
  const photoMemories = memories.filter(memory => memory.media_type === 'photo');

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
      const timestamp = memory.taken_at ? 
        format(new Date(memory.taken_at), 'yyyy-MM-dd_HH-mm-ss') : 
        format(new Date(memory.created_at), 'yyyy-MM-dd_HH-mm-ss');
      const filename = memory.title ? 
        `${memory.title.replace(/[^\w\s-]/g, '')}_${timestamp}.jpg` :
        `photo_${timestamp}.jpg`;
      
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
    if (!window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(memory.id);
    try {
      await onDelete(memory.id);
    } finally {
      setDeletingId(null);
    }
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

  if (photoMemories.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No photos yet</h3>
        <p className="text-muted-foreground">Upload your first photo to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photoMemories.map((memory) => (
          <Card key={memory.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-square bg-gradient-to-br from-primary/5 to-secondary/5">
              <img
                src={memory.media_url}
                alt={memory.title || 'Memory'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
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
        ))}
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
    </>
  );
};
