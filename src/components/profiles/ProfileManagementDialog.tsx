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
import { useIsMobile } from '@/hooks/use-mobile';
import { PermissionAwareActions } from '@/components/tracking/PermissionAwareActions';
import { DeleteProfileConfirmation } from './DeleteProfileConfirmation';
import { 
  Baby, 
  Plus, 
  Trash2, 
  UserCheck,
  Shield,
  Loader2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileManagementDialog = ({ open, onOpenChange }: ProfileManagementDialogProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
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

  // Mobile full-screen content
  if (isMobile && open) {
    return (
      <>
        <div className="fixed inset-0 z-[100] bg-background animate-slide-in-right">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center space-x-2">
              <Baby className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">{t('profiles.manage')}</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
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
                      <CardTitle className="flex items-center space-x-2 text-lg text-gray-500">
                        <Plus className="h-5 w-5" />
                        <span>{t('profiles.addNew')}</span>
                        <Shield className="h-4 w-4 ml-2" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        <p className="text-gray-600">Only account owners can create new child profiles.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              }
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Plus className="h-5 w-5" />
                    <span>{t('profiles.addNew')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profileName">{t('profiles.babyName')}</Label>
                      <Input
                        id="profileName"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder={t('profiles.enterBabyName')}
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">{t('profiles.birthDate')} ({t('common.optional')})</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={newProfileBirthDate}
                        onChange={(e) => setNewProfileBirthDate(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!newProfileName.trim() || isCreating}
                      className="w-full h-12 text-base touch-manipulation"
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
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Baby className="h-5 w-5" />
                  <span>{t('profiles.existing')} ({profiles.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-3">{t('common.loading')}</p>
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="text-center py-8">
                    <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('profiles.noProfiles')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profiles.map((profile) => {
                      const isProfileDeleting = isDeletingProfile === profile.id;
                      return (
                        <div 
                          key={profile.id} 
                          className={`p-4 border rounded-lg transition-all touch-manipulation ${
                            activeProfile?.id === profile.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          } ${isProfileDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <Baby className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-medium text-foreground truncate">{profile.name}</h3>
                                  {activeProfile?.id === profile.id && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Active
                                    </span>
                                  )}
                                  {profile.is_shared && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                                      <Shield className="h-3 w-3 mr-1" />
                                      {profile.user_role}
                                    </span>
                                  )}
                                </div>
                                {profile.birth_date && (
                                  <p className="text-sm text-muted-foreground">
                                    {t('profiles.born')} {format(new Date(profile.birth_date), 'MMM dd, yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {activeProfile?.id !== profile.id && !isProfileDeleting && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="px-3 py-2 touch-manipulation"
                                  onClick={() => handleSetActive(profile.id)}
                                >
                                  Set Active
                                </Button>
                              )}
                              
                              {/* Delete action - Only show for profiles you can delete */}
                              <PermissionAwareActions requiredPermission="canDelete" showMessage={false}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 touch-manipulation"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Delete button clicked for:', profile.id, profile.name);
                                    handleDeleteClick(profile.id, profile.name);
                                  }}
                                  disabled={isProfileDeleting || !!isDeletingProfile}
                                >
                                  {isProfileDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
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
          </div>
        </div>

        <DeleteProfileConfirmation
          isOpen={deleteConfirmation.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          profileName={deleteConfirmation.profileName}
          isProcessing={!!isDeletingProfile}
        />
      </>
    );
  }

  // Desktop modal experience
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <Baby className="h-6 w-6" />
              <span>{t('profiles.manage')}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
            {/* Role-based messaging for non-owners */}
            {role !== 'owner' && (
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
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
                      <CardTitle className="flex items-center space-x-2 text-lg text-gray-500">
                        <Plus className="h-5 w-5" />
                        <span>{t('profiles.addNew')}</span>
                        <Shield className="h-4 w-4 ml-2" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <p className="text-gray-600">Only account owners can create new child profiles.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null
              }
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Plus className="h-5 w-5" />
                    <span>{t('profiles.addNew')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profileName">{t('profiles.babyName')}</Label>
                        <Input
                          id="profileName"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          placeholder={t('profiles.enterBabyName')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">{t('profiles.birthDate')} ({t('common.optional')})</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={newProfileBirthDate}
                          onChange={(e) => setNewProfileBirthDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!newProfileName.trim() || isCreating}
                      className="w-full"
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
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Baby className="h-5 w-5" />
                  <span>{t('profiles.existing')} ({profiles.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-3">{t('common.loading')}</p>
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="text-center py-8">
                    <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('profiles.noProfiles')}</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {profiles.map((profile) => {
                      const isProfileDeleting = isDeletingProfile === profile.id;
                      return (
                        <div 
                          key={profile.id} 
                          className={`p-4 border rounded-lg transition-all ${
                            activeProfile?.id === profile.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          } ${isProfileDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <Baby className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-medium text-foreground truncate">{profile.name}</h3>
                                  {activeProfile?.id === profile.id && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      {t('profiles.active')}
                                    </span>
                                  )}
                                  {profile.is_shared && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Shared ({profile.user_role})
                                    </span>
                                  )}
                                </div>
                                {profile.birth_date && (
                                  <p className="text-sm text-muted-foreground">
                                    {t('profiles.born')} {format(new Date(profile.birth_date), 'MMM dd, yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {activeProfile?.id !== profile.id && !isProfileDeleting && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetActive(profile.id)}
                                >
                                  {t('profiles.setActive')}
                                </Button>
                              )}
                              
                              {/* Delete action - Only show for profiles you can delete */}
                              <PermissionAwareActions requiredPermission="canDelete" showMessage={false}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Delete button clicked for:', profile.id, profile.name);
                                    handleDeleteClick(profile.id, profile.name);
                                  }}
                                  disabled={isProfileDeleting || !!isDeletingProfile}
                                >
                                  {isProfileDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
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
