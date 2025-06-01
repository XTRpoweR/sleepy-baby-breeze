
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('components.sounds.soothingSounds')}</DialogTitle>
        </DialogHeader>
        <SoundsLibrary />
      </DialogContent>
    </Dialog>
  );
};
