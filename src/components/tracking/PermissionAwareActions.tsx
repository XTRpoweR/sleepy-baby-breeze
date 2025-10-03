
import { ReactNode } from 'react';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';

interface PermissionAwareActionsProps {
  children: ReactNode;
  requiredPermission: 'canEdit' | 'canDelete' | 'canInvite' | 'canView';
  fallback?: ReactNode;
  showMessage?: boolean;
  babyId?: string; // Optional override to target a specific baby profile
}

export const PermissionAwareActions = ({ 
  children, 
  requiredPermission, 
  fallback,
  showMessage = true,
  babyId
}: PermissionAwareActionsProps) => {
  const { activeProfile } = useBabyProfile();
  const targetBabyId = (babyId ?? activeProfile?.id) || null;
  const { permissions, role, loading } = useProfilePermissions(targetBabyId);

  if (loading) {
    return null;
  }

  const hasPermission = permissions[requiredPermission];

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showMessage) {
      const getPermissionMessage = () => {
        switch (requiredPermission) {
          case 'canEdit':
            return `As a ${role}, you can only view activities. Contact the baby's owner for caregiver access to add or edit activities.`;
          case 'canDelete':
            return `Only the baby's owner can delete activities.`;
          case 'canInvite':
            return `Only the baby's owner can invite family members.`;
          case 'canView':
            return `You don't have permission to view this baby's data.`;
          default:
            return `You don't have permission to perform this action.`;
        }
      };

      return (
        <Alert className="border-amber-200 bg-amber-50">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {getPermissionMessage()}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};
