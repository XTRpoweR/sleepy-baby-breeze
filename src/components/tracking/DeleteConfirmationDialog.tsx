import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm, isDeleting = false }: DeleteConfirmationDialogProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // Mobile: bottom sheet (Drawer) with guaranteed visible buttons
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <DrawerContent className="focus:outline-none">
          <div className="mx-auto w-full max-w-md px-4 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
            </div>

            <DrawerHeader>
              <DrawerTitle className="text-center text-xl">
                {t('common.delete')}?
              </DrawerTitle>
              <DrawerDescription className="text-center">
                {t('common.confirm')}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-3 mt-4">
              <Button
                variant="destructive"
                onClick={onConfirm}
                disabled={isDeleting}
                size="lg"
                className="w-full h-14 text-base font-semibold"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                {isDeleting ? t('common.loading') : t('common.delete')}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                size="lg"
                className="w-full h-14 text-base"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: standard AlertDialog
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            {t('common.delete')}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t('common.confirm')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
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
