
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SoundsLibrary } from './SoundsLibrary';

interface SoundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SoundsDialog = ({ open, onOpenChange }: SoundsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Soothing Sounds & Audio</DialogTitle>
        </DialogHeader>
        <SoundsLibrary />
      </DialogContent>
    </Dialog>
  );
};
