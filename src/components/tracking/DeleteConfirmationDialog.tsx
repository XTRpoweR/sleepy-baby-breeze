import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm, isDeleting = false }: DeleteConfirmationDialogProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // On mobile: use bottom Drawer — works reliably with safe-areas and iPhone home indicator
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <DrawerContent className="pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DrawerHeader>
            <DrawerTitle>{t('common.delete')}</DrawerTitle>
            <DrawerDescription>{t('common.confirm')}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex flex-col gap-2 pt-2">
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full h-12"
            >
              {isDeleting ? t('common.loading') : t('common.delete')}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full h-12"
            >
              {t('common.cancel')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // On desktop: use AlertDialog (standard modal with buttons)
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.delete')}</AlertDialogTitle>
          <AlertDialogDescription>{t('common.confirm')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t('common.loading') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
