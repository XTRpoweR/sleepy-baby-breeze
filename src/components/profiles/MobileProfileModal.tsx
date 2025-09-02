
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
        <DialogContent 
          className="w-[95vw] max-w-md max-h-[90vh] flex flex-col p-0 gap-0 bg-soft gradient-dynamic-slow border-0 shadow-2xl rounded-3xl"
          style={{ 
            position: 'fixed',
            top: '5vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999
          }}
        >
          <DialogHeader className="p-6 pb-4 border-b border-border/10 bg-gradient-to-br from-primary/5 to-primary/10 flex-shrink-0 rounded-t-3xl">
            <DialogTitle className="flex items-center space-x-3 text-xl font-bold">
              <div className="bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl p-2">
                <Baby className="h-6 w-6 text-primary" />
              </div>
              <span className="text-foreground">Child Profiles</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50 backdrop-blur-sm min-h-0">
            {profiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-muted/50 to-muted/70 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Baby className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">No profiles found</p>
              </div>
            ) : (
              profiles.map((profile) => (
                <button
                  key={profile.id}
                  className={`w-full flex items-center space-x-4 p-5 rounded-2xl border-2 text-left transition-all duration-300 touch-manipulation transform hover:scale-[1.02] ${
                    activeProfile?.id === profile.id
                      ? 'bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30 shadow-xl ring-2 ring-primary/20'
                      : 'bg-white/70 backdrop-blur-sm border-border/20 hover:bg-white/90 hover:border-border/40 hover:shadow-lg active:scale-[0.98]'
                  }`}
                  onClick={() => handleProfileSwitch(profile.id)}
                  disabled={switching}
                >
                  <Avatar className="h-14 w-14 flex-shrink-0 shadow-lg ring-2 ring-white/50">
                    <AvatarImage src={profile.photo_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary">
                      <Baby className="h-7 w-7" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-lg text-foreground truncate">{profile.name}</h3>
                      {activeProfile?.id === profile.id && (
                        <Badge className="text-xs bg-gradient-to-r from-primary/90 to-primary text-primary-foreground font-semibold px-3 py-1 flex-shrink-0 shadow-sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      {profile.birth_date && (
                        <span className="text-muted-foreground font-medium">
                          {new Date(profile.birth_date).toLocaleDateString()}
                        </span>
                      )}
                      {profile.is_shared && (
                        <Badge variant="outline" className="text-xs bg-gradient-to-r from-info/10 to-info/20 border-info/30 text-info font-medium">
                          {profile.user_role === 'viewer' ? 'Viewer' : 
                           profile.user_role === 'caregiver' ? 'Caregiver' : 'Shared'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {activeProfile?.id === profile.id && (
                    <div className="bg-gradient-to-br from-primary/20 to-primary/30 rounded-full p-2 flex-shrink-0">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="p-6 border-t border-border/10 bg-gradient-to-br from-muted/5 to-muted/10 flex-shrink-0 rounded-b-3xl">
            <Button
              onClick={handleManageProfiles}
              className="w-full flex items-center justify-center space-x-3 h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-accent/10 to-accent/20 hover:from-accent/20 hover:to-accent/30 border-2 border-accent/20 hover:border-accent/30 text-accent hover:text-accent"
              variant="outline"
            >
              <div className="bg-gradient-to-br from-accent/20 to-accent/30 rounded-lg p-1">
                <Settings className="h-4 w-4 text-accent" />
              </div>
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
