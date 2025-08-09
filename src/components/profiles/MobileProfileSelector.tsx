
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

  const handleProfileSwitch = async (profileId: string) => {
    const success = await switchProfile(profileId);
    if (success) {
      setSheetOpen(false);
    }
  };

  if (!activeProfile) return null;

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2 p-2 h-auto justify-start w-full max-w-[200px]"
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

        <SheetContent side="bottom" className="h-[80vh] flex flex-col">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center space-x-2">
              <Baby className="h-5 w-5 text-purple-600" />
              <span>Child Profiles</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  activeProfile?.id === profile.id
                    ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleProfileSwitch(profile.id)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.photo_url || ''} />
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    <Baby className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-base truncate">{profile.name}</h3>
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
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={() => {
                setSheetOpen(false);
                setShowManagement(true);
              }}
              className="w-full flex items-center space-x-2"
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
