
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SoundsLibrary } from './SoundsLibrary';
import { PermissionAwareActions } from '@/components/tracking/PermissionAwareActions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { useBabyProfile } from '@/hooks/useBabyProfile';

interface SoundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SoundsDialog = ({ open, onOpenChange }: SoundsDialogProps) => {
  const { t } = useTranslation();
  const { activeProfile } = useBabyProfile();
  const { role } = useProfilePermissions(activeProfile?.id || null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('components.sounds.soothingSounds')}</DialogTitle>
        </DialogHeader>
        
        {/* Note: Sounds are generally available to all users as they're for soothing/entertainment */}
        {/* Viewers can use sounds without restrictions as it doesn't modify baby data */}
        <SoundsLibrary />
        
        {role === 'viewer' && (
          <Alert className="mt-4 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You can play and use all soothing sounds. Sound preferences and timers are available to help with baby care routines.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};
