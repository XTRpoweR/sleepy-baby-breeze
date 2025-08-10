
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Baby, Settings, Check } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { ProfileManagementDialog } from './ProfileManagementDialog';

interface MobileProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileProfileModal = ({ isOpen, onClose }: MobileProfileModalProps) => {
  const { profiles, activeProfile, switching, switchProfile } = useBabyProfile();
  const [showManagement, setShowManagement] = useState(false);

  const handleProfileSwitch = async (profileId: string) => {
    if (activeProfile?.id === profileId) {
      onClose();
      return;
    }
    
    console.log('Mobile modal switching to profile:', profileId);
    const success = await switchProfile(profileId);
    if (success) {
      // Close modal immediately after successful switch - no page refresh needed
      onClose();
    }
  };

  const handleManageProfiles = () => {
    console.log('Mobile modal opening profile management');
    onClose(); // Close the profile selector first
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      setShowManagement(true);
    }, 100);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90vw] max-w-md max-h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b bg-white flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2 text-lg">
              <Baby className="h-5 w-5 text-purple-600" />
              <span>Child Profiles</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select or manage child profiles for tracking activities
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white min-h-0">
            {profiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Baby className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No profiles found</p>
              </div>
            ) : (
              profiles.map((profile) => (
                <button
                  key={profile.id}
                  className={`w-full flex items-center space-x-3 p-4 rounded-lg border text-left transition-all touch-manipulation ${
                    activeProfile?.id === profile.id
                      ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100'
                  }`}
                  onClick={() => handleProfileSwitch(profile.id)}
                  disabled={switching}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={profile.photo_url || ''} />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      <Baby className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-base truncate">{profile.name}</h3>
                      {activeProfile?.id === profile.id && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 flex-shrink-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {profile.birth_date && (
                        <span>{new Date(profile.birth_date).toLocaleDateString()}</span>
                      )}
                      {profile.is_shared && (
                        <Badge variant="outline" className="text-xs">
                          {profile.user_role === 'viewer' ? 'Viewer' : 
                           profile.user_role === 'caregiver' ? 'Caregiver' : 'Shared'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {activeProfile?.id === profile.id && (
                    <Check className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t bg-white flex-shrink-0">
            <Button
              onClick={handleManageProfiles}
              className="w-full flex items-center space-x-2 h-12 text-base touch-manipulation"
              variant="outline"
            >
              <Settings className="h-4 w-4" />
              <span>Manage Profiles</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileManagementDialog 
        open={showManagement}
        onOpenChange={setShowManagement}
      />
    </>
  );
};
