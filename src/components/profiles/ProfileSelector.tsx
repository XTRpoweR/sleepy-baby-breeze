
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Settings, Baby, User } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { ProfileManagementDialog } from './ProfileManagementDialog';

export const ProfileSelector = () => {
  const { profiles, activeProfile, switching, switchProfile } = useBabyProfile();
  const [showManagement, setShowManagement] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleProfileSwitch = async (profileId: string) => {
    const success = await switchProfile(profileId);
    if (success) {
      setDropdownOpen(false);
    }
  };

  if (!activeProfile) return null;

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2 p-2 h-auto justify-start hover:bg-gray-100"
            disabled={switching}
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
            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="start" 
          className="w-80 max-h-[500px] overflow-y-auto z-[9999]"
          sideOffset={4}
        >
          <div className="p-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center">
              <Baby className="h-4 w-4 mr-2 text-purple-600" />
              Child Profiles
            </h4>
            
            {profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                className={`flex items-center space-x-3 p-3 cursor-pointer rounded-lg mb-1 ${
                  activeProfile?.id === profile.id
                    ? 'bg-purple-50 text-purple-900'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleProfileSwitch(profile.id)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.photo_url || ''} />
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    <Baby className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium truncate">{profile.name}</span>
                    {activeProfile?.id === profile.id && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
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
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              setShowManagement(true);
            }}
            className="flex items-center space-x-2 p-3 cursor-pointer"
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
