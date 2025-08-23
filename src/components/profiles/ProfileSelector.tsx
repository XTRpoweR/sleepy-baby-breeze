
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Settings, Baby, User } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { ProfileManagementDialog } from './ProfileManagementDialog';

export const ProfileSelector = () => {
  const { profiles, activeProfile, switching, switchProfile, forceUpdateCounter } = useBabyProfile();
  const [showManagement, setShowManagement] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Debug logging for component updates
  useEffect(() => {
    console.log('ProfileSelector updated:', {
      profilesCount: profiles.length,
      activeProfileName: activeProfile?.name,
      activeProfileId: activeProfile?.id,
      switching,
      forceUpdateCounter
    });
  }, [profiles, activeProfile, switching, forceUpdateCounter]);

  const handleProfileSwitch = async (profileId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('ProfileSelector handleProfileSwitch called:', {
      targetProfileId: profileId,
      currentActiveId: activeProfile?.id,
      switching
    });
    
    if (switching) {
      console.log('Profile switch already in progress, ignoring click');
      return;
    }
    
    if (activeProfile?.id === profileId) {
      console.log('Target profile is already active, closing dropdown');
      setDropdownOpen(false);
      return;
    }
    
    console.log('Starting profile switch process...');
    const success = await switchProfile(profileId);
    
    console.log('Profile switch result:', { success, targetProfileId: profileId });
    
    if (success) {
      console.log('Profile switch successful, closing dropdown');
      setDropdownOpen(false);
      
      // Force a small delay to ensure state has propagated
      setTimeout(() => {
        console.log('Post-switch state check:', {
          newActiveProfile: activeProfile?.id,
          targetProfile: profileId
        });
      }, 200);
    } else {
      console.log('Profile switch failed');
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    console.log('ProfileSelector dropdown open change:', open);
    setDropdownOpen(open);
  };

  const handleManageProfiles = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Opening profile management from ProfileSelector');
    setDropdownOpen(false);
    setShowManagement(true);
  };

  const handleTriggerClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('ProfileSelector trigger clicked, current state:', dropdownOpen);
    setDropdownOpen(!dropdownOpen);
  };

  if (!activeProfile) {
    console.log('No active profile, not rendering ProfileSelector');
    return null;
  }

  console.log('Rendering ProfileSelector with active profile:', activeProfile.name);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2 p-2 h-auto justify-start hover:bg-gray-100 touch-manipulation"
            disabled={switching}
            onClick={handleTriggerClick}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={activeProfile.photo_url || ''} />
              <AvatarFallback className="bg-purple-100 text-purple-700">
                <Baby className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="text-left min-w-0">
              <div className="font-medium text-sm truncate max-w-[150px]">{activeProfile.name}</div>
              <div className="text-xs text-muted-foreground">
                {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 opacity-50 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="start" 
          className="w-80 max-w-[90vw] max-h-[70vh] overflow-y-auto bg-white border border-gray-200 shadow-xl z-[1000] scrollbar-thin"
          sideOffset={4}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-3 bg-white">
            <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center">
              <Baby className="h-4 w-4 mr-2 text-purple-600" />
              Child Profiles
            </h4>
            
            {profiles.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">
                No profiles found
              </div>
            ) : (
              profiles.map((profile) => {
                const isActive = activeProfile?.id === profile.id;
                console.log(`Rendering profile ${profile.name}:`, { 
                  isActive, 
                  profileId: profile.id, 
                  activeId: activeProfile?.id 
                });
                
                return (
                  <div
                    key={profile.id}
                    className={`flex items-center space-x-3 p-3 cursor-pointer rounded-lg mb-1 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 min-h-[56px] ${
                      isActive
                        ? 'bg-purple-50 text-purple-900 border border-purple-200'
                        : 'bg-white hover:bg-gray-50 focus:bg-gray-50'
                    } ${switching ? 'opacity-50 cursor-not-allowed' : 'touch-manipulation'}`}
                    onClick={(e) => !switching && handleProfileSwitch(profile.id, e)}
                    role="button"
                    tabIndex={switching ? -1 : 0}
                    aria-label={`Switch to ${profile.name} profile`}
                    onKeyDown={(e) => {
                      if (!switching && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleProfileSwitch(profile.id, e as any);
                      }
                    }}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={profile.photo_url || ''} />
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        <Baby className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium truncate">{profile.name}</span>
                        {isActive && (
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

                    {isActive && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          <DropdownMenuSeparator className="bg-gray-200" />
          
          <DropdownMenuItem
            className="flex items-center space-x-2 p-3 cursor-pointer bg-white hover:bg-gray-50 focus:bg-gray-50 touch-manipulation min-h-[48px]"
            onSelect={(e) => e.preventDefault()}
            onClick={handleManageProfiles}
          >
            <Settings className="h-4 w-4" />
            <span>Manage Profiles</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileManagementDialog 
        open={showManagement}
        onOpenChange={setShowManagement}
      />
    </>
  );
};
