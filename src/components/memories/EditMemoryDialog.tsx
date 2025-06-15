
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Memory {
  id: string;
  title: string | null;
  description: string | null;
  taken_at: string | null;
}

interface EditMemoryDialogProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (memoryId: string, updates: { title?: string; description?: string; taken_at?: Date | null }) => Promise<boolean>;
}

export const EditMemoryDialog = ({ memory, isOpen, onClose, onUpdate }: EditMemoryDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title || '');
      setDescription(memory.description || '');
      setTakenAt(
        memory.taken_at 
          ? format(new Date(memory.taken_at), "yyyy-MM-dd'T'HH:mm")
          : ''
      );
    }
  }, [memory]);

  const handleUpdate = async () => {
    if (!memory) return;

    setUpdating(true);
    const takenAtDate = takenAt ? new Date(takenAt) : null;
    const success = await onUpdate(memory.id, {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      taken_at: takenAtDate,
    });
    
    if (success) {
      onClose();
    }
    setUpdating(false);
  };

  const handleClose = () => {
    if (!updating) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Memory</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Memory title..."
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Date Taken */}
          <div className="space-y-2">
            <Label htmlFor="edit-takenAt">Date Taken</Label>
            <div className="relative">
              <Input
                id="edit-takenAt"
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
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? 'Updating...' : 'Update Memory'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
