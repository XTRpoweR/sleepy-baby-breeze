
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Settings, Baby, Check } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { ProfileManagementDialog } from './ProfileManagementDialog';
import { formatLocalizedDate, formatAge } from '@/utils/dateLocalization';

export const ProfileSelector = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en';
  const { profiles, activeProfile, switching, switchProfile } = useBabyProfile();
  const [showManagement, setShowManagement] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleProfileSwitch = async (profileId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (activeProfile?.id === profileId) {
      return; // Don't close dropdown if clicking on active profile
    }
    
    console.log('Switching to profile:', profileId);
    const success = await switchProfile(profileId);
    if (success) {
      setDropdownOpen(false); // Only close on successful switch
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    console.log('Dropdown open change:', open);
    setDropdownOpen(open);
  };

  const handleManageProfiles = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Opening profile management');
    setDropdownOpen(false);
    setShowManagement(true);
  };

  const handleTriggerClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  if (!activeProfile) {
    console.log('No active profile, not rendering ProfileSelector');
    return null;
  }

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
            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="start" 
          className="w-80 max-w-[90vw] max-h-[70vh] overflow-hidden bg-white border border-gray-200 shadow-2xl z-[1000] p-0 rounded-2xl"
          sideOffset={8}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Gradient header */}
          <div className="p-4 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full">
                <Baby className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Child Profiles</div>
                <div className="text-[11px] text-white/80">
                  {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} · Click to switch
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 max-h-[50vh] overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-1.5">
            {profiles.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">No profiles found</div>
            ) : (
              profiles.map((profile) => {
                const isActive = activeProfile?.id === profile.id;
                return (
                  <div
                    key={profile.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl border transition-all touch-manipulation focus:outline-none ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 ring-2 ring-purple-200'
                        : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                    }`}
                    onClick={(e) => handleProfileSwitch(profile.id, e)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Switch to ${profile.name} profile`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleProfileSwitch(profile.id, e as any);
                      }
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className={`h-12 w-12 ${isActive ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}>
                        <AvatarImage src={profile.photo_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
                          <Baby className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      {isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 ring-2 ring-white">
                          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-gray-900 truncate">{profile.name}</span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Active
                          </span>
                        )}
                      </div>
                      {profile.birth_date && (
                        <div className="text-[11px] text-purple-600 font-medium">
                          {formatAge(profile.birth_date, locale)}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap mt-0.5">
                        {profile.birth_date && (
                          <span dir="ltr" className="tabular-nums">
                            {formatLocalizedDate(profile.birth_date, 'd MMM yyyy', locale)}
                          </span>
                        )}
                        {profile.is_shared && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal border-blue-200 bg-blue-50 text-blue-700">
                            {profile.user_role === 'viewer' ? 'Viewer' :
                             profile.user_role === 'caregiver' ? 'Caregiver' : 'Shared'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DropdownMenuSeparator className="bg-gray-200 m-0" />

          <DropdownMenuItem
            className="flex items-center justify-center gap-2 p-3 cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white focus:text-white touch-manipulation min-h-[48px] rounded-none"
            onSelect={(e) => e.preventDefault()}
            onClick={handleManageProfiles}
          >
            <Settings className="h-4 w-4" />
            <span className="font-medium">Manage Profiles</span>
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
