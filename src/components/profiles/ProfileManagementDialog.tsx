
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { useProfileDeletion } from '@/hooks/useProfileDeletion';
import { PermissionAwareActions } from '@/components/tracking/PermissionAwareActions';
import { DeleteProfileConfirmation } from './DeleteProfileConfirmation';
import { 
  Baby, 
  Plus, 
  Trash2, 
  UserCheck,
  Shield,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileManagementDialog = ({ open, onOpenChange }: ProfileManagementDialogProps) => {
  const { t } = useTranslation();
  const { profiles, activeProfile, createProfile, switchProfile, loading, refetch } = useBabyProfile();
  const { role } = useProfilePermissions(activeProfile?.id || null);
  const { deleteProfileCompletely, isDeletingProfile } = useProfileDeletion();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileBirthDate, setNewProfileBirthDate] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    profileId: string;
    profileName: string;
  }>({
    isOpen: false,
    profileId: '',
    profileName: ''
  });

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    setIsCreating(true);
    try {
      const success = await createProfile({
        name: newProfileName.trim(),
        birth_date: newProfileBirthDate || null,
      });

      if (success) {
        setNewProfileName('');
        setNewProfileBirthDate('');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (profileId: string, profileName: string) => {
    console.log('Delete clicked for profile:', profileId, profileName);
    setDeleteConfirmation({
      isOpen: true,
      profileId,
      profileName
    });
  };

  const handleDeleteConfirm = async () => {
    const { profileId, profileName } = deleteConfirmation;
    
    console.log('Confirming deletion for:', profileId, profileName);
    
    // Close confirmation dialog immediately
    setDeleteConfirmation({
      isOpen: false,
      profileId: '',
      profileName: ''
    });

    // Perform deletion
    const success = await deleteProfileCompletely(profileId, profileName);
    
    if (success) {
      console.log('Deletion successful, refreshing profiles...');
      // Force refresh profiles list
      await refetch();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      profileId: '',
      profileName: ''
    });
  };

  const handleSetActive = async (profileId: string) => {
    await switchProfile(profileId);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 m-4 sm:m-0"
          style={{
            position: 'fixed',
            top: '5vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            maxWidth: 'min(95vw, 42rem)',
            maxHeight: '90vh'
          }}
        >
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b bg-white">
            <DialogTitle className="flex items-center space-x-2 text-lg">
              <Baby className="h-5 w-5" />
              <span>{t('profiles.manage')}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Role-based messaging for non-owners */}
              {role !== 'owner' && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    {role === 'viewer' 
                      ? "You have view-only access to baby profiles. You can see profile information but cannot create, edit, or delete profiles. Contact the baby's owner for management permissions if needed."
                      : "As a caregiver, you can track activities but cannot create new profiles or manage account settings. Only the account owner can create new child profiles."
                    }
                  </AlertDescription>
                </Alert>
              )}

              {/* Create New Profile - Only for account owners */}
              <PermissionAwareActions 
                requiredPermission="canInvite" 
                showMessage={false}
                fallback={
                  role !== 'owner' ? (
                    <Card className="opacity-60">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg text-gray-500">
                          <Plus className="h-4 w-4" />
                          <span>{t('profiles.addNew')}</span>
                          <Shield className="h-4 w-4 ml-2" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-3 sm:py-4">
                          <p className="text-gray-600 text-sm">Only account owners can create new child profiles.</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null
                }
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                      <Plus className="h-4 w-4" />
                      <span>{t('profiles.addNew')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateProfile} className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="profileName" className="text-sm">{t('profiles.babyName')}</Label>
                        <Input
                          id="profileName"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          placeholder={t('profiles.enterBabyName')}
                          className="text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-sm">{t('profiles.birthDate')} ({t('common.optional')})</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={newProfileBirthDate}
                          onChange={(e) => setNewProfileBirthDate(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!newProfileName.trim() || isCreating}
                        className="w-full text-sm sm:text-base py-2 sm:py-3 touch-manipulation"
                      >
                        {isCreating ? t('common.creating') : t('profiles.createProfile')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </PermissionAwareActions>

              {/* Existing Profiles */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <Baby className="h-4 w-4" />
                    <span>{t('profiles.existing')} ({profiles.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2 text-sm">{t('common.loading')}</p>
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Baby className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-600 text-sm">{t('profiles.noProfiles')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {profiles.map((profile) => {
                        const isProfileDeleting = isDeletingProfile === profile.id;
                        return (
                          <div 
                            key={profile.id} 
                            className={`p-3 sm:p-4 border rounded-lg transition-all touch-manipulation ${
                              activeProfile?.id === profile.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            } ${isProfileDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                <div className="bg-blue-100 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                                  <Baby className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2 mb-0.5 sm:mb-1">
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{profile.name}</h3>
                                    {activeProfile?.id === profile.id && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                                        <UserCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                        <span className="hidden sm:inline">{t('profiles.active')}</span>
                                        <span className="sm:hidden">Active</span>
                                      </span>
                                    )}
                                    {profile.is_shared && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                                        <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                        <span className="hidden sm:inline">Shared ({profile.user_role})</span>
                                        <span className="sm:hidden">{profile.user_role}</span>
                                      </span>
                                    )}
                                  </div>
                                  {profile.birth_date && (
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {t('profiles.born')} {format(new Date(profile.birth_date), 'MMM dd, yyyy')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                                {activeProfile?.id !== profile.id && !isProfileDeleting && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 touch-manipulation"
                                    onClick={() => handleSetActive(profile.id)}
                                  >
                                    <span className="hidden sm:inline">{t('profiles.setActive')}</span>
                                    <span className="sm:hidden">Set Active</span>
                                  </Button>
                                )}
                                
                                {/* Delete action - Only show for profiles you can delete */}
                                <PermissionAwareActions requiredPermission="canDelete" showMessage={false}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 sm:p-2 touch-manipulation"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Delete button clicked for:', profile.id, profile.name);
                                      handleDeleteClick(profile.id, profile.name);
                                    }}
                                    disabled={isProfileDeleting || !!isDeletingProfile}
                                  >
                                    {isProfileDeleting ? (
                                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    )}
                                  </Button>
                                </PermissionAwareActions>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bottom padding for mobile to ensure content doesn't get cut off */}
              <div className="h-4 sm:h-0" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteProfileConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        profileName={deleteConfirmation.profileName}
        isProcessing={!!isDeletingProfile}
      />
    </>
  );
};
