
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

interface DeleteProfileConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  profileName: string;
  isProcessing?: boolean;
}

export const DeleteProfileConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  profileName,
  isProcessing = false
}: DeleteProfileConfirmationProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Delete {profileName}'s Profile?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="font-medium text-gray-900">
              This action cannot be undone. This will permanently delete:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>All activity tracking records (feeding, sleep, diaper changes)</li>
              <li>All photo memories</li>
              <li>All sleep schedules and recommendations</li>
              <li>All family sharing permissions</li>
              <li>The baby profile itself</li>
            </ul>
            <p className="text-red-600 font-medium mt-4">
              Are you absolutely sure you want to delete {profileName}'s profile?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isProcessing}
          >
            {isProcessing ? 'Deleting…' : 'Delete Profile'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
