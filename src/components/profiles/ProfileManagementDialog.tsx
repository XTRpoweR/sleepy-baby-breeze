
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { PermissionAwareActions } from '@/components/tracking/PermissionAwareActions';
import { 
  Baby, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileManagementDialog = ({ isOpen, onClose }: ProfileManagementDialogProps) => {
  const { t } = useTranslation();
  const { profiles, activeProfile, createProfile, deleteProfile, switchProfile, loading } = useBabyProfile();
  const { role } = useProfilePermissions(activeProfile?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileBirthDate, setNewProfileBirthDate] = useState('');

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    setIsCreating(true);
    const success = await createProfile({
      name: newProfileName.trim(),
      birth_date: newProfileBirthDate || null,
    });

    if (success) {
      setNewProfileName('');
      setNewProfileBirthDate('');
    }
    setIsCreating(false);
  };

  const handleDeleteProfile = async (profileId: string) => {
    await deleteProfile(profileId);
  };

  const handleSetActive = async (profileId: string) => {
    await switchProfile(profileId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Baby className="h-5 w-5" />
            <span>{t('profiles.manage')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg text-gray-500">
                      <Plus className="h-4 w-4" />
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
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Plus className="h-4 w-4" />
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
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Baby className="h-4 w-4" />
                <span>{t('profiles.existing')} ({profiles.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">{t('common.loading')}</p>
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-8">
                  <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('profiles.noProfiles')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id} 
                      className={`p-4 border rounded-lg transition-colors ${
                        activeProfile?.id === profile.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                            <Baby className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{profile.name}</h3>
                              {activeProfile?.id === profile.id && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  {t('profiles.active')}
                                </span>
                              )}
                            </div>
                            {profile.birth_date && (
                              <p className="text-sm text-gray-600">
                                {t('profiles.born')} {format(new Date(profile.birth_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {activeProfile?.id !== profile.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetActive(profile.id)}
                            >
                              {t('profiles.setActive')}
                            </Button>
                          )}
                          
                          {/* Delete action - Only for account owners */}
                          <PermissionAwareActions requiredPermission="canDelete" showMessage={false}>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('profiles.deleteProfile')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('profiles.deleteConfirmation', { name: profile.name })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProfile(profile.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {t('common.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </PermissionAwareActions>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
