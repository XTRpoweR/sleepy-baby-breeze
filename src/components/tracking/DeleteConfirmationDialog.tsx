import { useTranslation } from 'react-i18next';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  isDeleting = false
}: DeleteConfirmationDialogProps) => {
  const { t } = useTranslation();

  return (
    <Drawer 
      open={open} 
      onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
      modal={false}
    >
      <DrawerContent className="pointer-events-auto">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-destructive">
            {t('common.delete')}
          </DrawerTitle>
          <DrawerDescription>
            {t('common.confirm')}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex-row justify-center gap-3 pb-6">
          <Button variant="outline" onClick={onClose} disabled={isDeleting} className="flex-1">
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? t('common.loading') : t('common.delete')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
