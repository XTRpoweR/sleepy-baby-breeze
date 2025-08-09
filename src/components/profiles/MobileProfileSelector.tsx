
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Plus, Settings, User, Baby } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { ProfileManagementDialog } from './ProfileManagementDialog';

export const MobileProfileSelector = () => {
  const { profiles, activeProfile, switching, switchProfile } = useBabyProfile();
  const [showManagement, setShowManagement] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Debug logging
  console.log('MobileProfileSelector render:', { profiles, activeProfile, switching });

  const handleProfileSwitch = async (profileId: string) => {
    console.log('Mobile switching to profile:', profileId);
    const success = await switchProfile(profileId);
    if (success) {
      setSheetOpen(false);
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    console.log('Mobile sheet open change:', open);
    setSheetOpen(open);
  };

  const handleManageProfiles = () => {
    console.log('Mobile opening profile management');
    setSheetOpen(false);
    setShowManagement(true);
  };

  if (!activeProfile) {
    console.log('No active profile, not rendering MobileProfileSelector');
    return null;
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2 p-2 h-auto justify-start w-full max-w-[200px] touch-manipulation"
            disabled={switching}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={activeProfile.photo_url || ''} />
              <AvatarFallback className="bg-purple-100 text-purple-700">
                <Baby className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium text-sm truncate">{activeProfile.name}</div>
              <div className="text-xs text-muted-foreground">
                {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </SheetTrigger>

        <SheetContent 
          side="bottom" 
          className="h-[85vh] sm:h-[80vh] md:h-[75vh] flex flex-col !z-[9999] overflow-hidden !bg-white border-t border-gray-200 shadow-2xl safe-area-inset-bottom"
          style={{ 
            zIndex: 9999, 
            backgroundColor: 'white',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0
          }}
        >
          <SheetHeader className="pb-4 flex-shrink-0 bg-white border-b border-gray-100 px-4 pt-4">
            <SheetTitle className="flex items-center space-x-2 text-left">
              <Baby className="h-5 w-5 text-purple-600" />
              <span>Child Profiles</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pb-4 bg-white px-4 pt-2 scrollbar-thin">
            {profiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Baby className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No profiles found</p>
              </div>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all bg-white touch-manipulation min-h-[60px] ${
                    activeProfile?.id === profile.id
                      ? '!bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                      : 'border-gray-200 hover:!bg-gray-50 hover:border-gray-300 active:!bg-gray-100'
                  }`}
                  onClick={() => handleProfileSwitch(profile.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProfileSwitch(profile.id);
                    }
                  }}
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
                    <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-4 pb-6 border-t flex-shrink-0 bg-white px-4 safe-area-inset-bottom">
            <Button
              onClick={handleManageProfiles}
              className="w-full flex items-center space-x-2 h-12 text-base touch-manipulation"
              variant="outline"
            >
              <Settings className="h-4 w-4" />
              <span>Manage Profiles</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ProfileManagementDialog 
        open={showManagement}
        onOpenChange={setShowManagement}
      />
    </>
  );
};
