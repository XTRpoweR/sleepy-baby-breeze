
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar, 
  Download,
  Play,
  Pause
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { EditMemoryDialog } from './EditMemoryDialog';

interface Memory {
  id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: 'photo' | 'video';
  taken_at: string | null;
  created_at: string;
}

interface MemoryGridProps {
  memories: Memory[];
  onDelete: (memoryId: string) => Promise<boolean>;
  onUpdate: (memoryId: string, updates: { title?: string; description?: string; taken_at?: Date | null }) => Promise<boolean>;
  canEdit: boolean;
}

export const MemoryGrid = ({ memories, onDelete, onUpdate, canEdit }: MemoryGridProps) => {
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (memoryId: string) => {
    if (!canEdit) return;
    
    setDeletingId(memoryId);
    await onDelete(memoryId);
    setDeletingId(null);
  };

  const handleDownload = (memory: Memory) => {
    const link = document.createElement('a');
    link.href = memory.media_url;
    link.download = `${memory.title || 'memory'}_${memory.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleVideo = (memoryId: string) => {
    setPlayingVideo(prev => prev === memoryId ? null : memoryId);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {memories.map((memory) => (
          <Card key={memory.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              {memory.media_type === 'photo' ? (
                <img
                  src={memory.media_url}
                  alt={memory.title || 'Baby memory'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={memory.media_url}
                    className="w-full h-full object-cover"
                    controls={playingVideo === memory.id}
                    preload="metadata"
                  />
                  {playingVideo !== memory.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100"
                        onClick={() => toggleVideo(memory.id)}
                      >
                        <Play className="h-6 w-6 text-gray-700" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Media Type Badge */}
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 text-xs"
              >
                {memory.media_type === 'photo' ? '📷' : '🎥'} {memory.media_type}
              </Badge>

              {/* Actions Menu */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-white bg-opacity-90">
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
                        <DropdownMenuItem onClick={() => setEditingMemory(memory)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(memory.id)}
                          className="text-red-600"
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

            <CardContent className="p-4">
              <div className="space-y-2">
                {memory.title && (
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {memory.title}
                  </h3>
                )}
                
                {memory.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {memory.description}
                  </p>
                )}

                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {memory.taken_at 
                    ? format(new Date(memory.taken_at), 'MMM d, yyyy')
                    : format(new Date(memory.created_at), 'MMM d, yyyy')
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <EditMemoryDialog
        memory={editingMemory}
        isOpen={!!editingMemory}
        onClose={() => setEditingMemory(null)}
        onUpdate={onUpdate}
      />
    </>
  );
};
