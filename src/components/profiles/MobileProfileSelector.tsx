
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Baby, ChevronDown, Plus, Settings, Loader2, Users, Crown, Heart, Shield } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';

interface MobileProfileSelectorProps {
  onAddProfile: () => void;
  onManageProfiles: () => void;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'owner': return Crown;
    case 'caregiver': return Heart;
    case 'viewer': return Shield;
    default: return Users;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'owner': return 'bg-yellow-100 text-yellow-800';
    case 'caregiver': return 'bg-blue-100 text-blue-800';
    case 'viewer': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const MobileProfileSelector = ({ onAddProfile, onManageProfiles }: MobileProfileSelectorProps) => {
  const { activeProfile, profiles, switching, switchProfile } = useBabyProfile();
  const [isOpen, setIsOpen] = useState(false);

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths}mo`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}y ${months}mo` : `${years}y`;
    }
  };

  const handleProfileSwitch = async (profileId: string) => {
    await switchProfile(profileId);
    setIsOpen(false);
  };

  const handleAddProfile = () => {
    onAddProfile();
    setIsOpen(false);
  };

  const handleManageProfiles = () => {
    onManageProfiles();
    setIsOpen(false);
  };

  if (!activeProfile) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-4 text-center">
          <Baby className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2 text-sm">No Child Profiles</h3>
          <p className="text-gray-600 mb-3 text-xs">Create your first child profile to get started</p>
          <Button onClick={onAddProfile} size="sm" className="bg-blue-600 hover:bg-blue-700 w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Child Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  const RoleIcon = getRoleIcon(activeProfile.user_role || 'owner');

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full h-auto p-3 justify-between" disabled={switching}>
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {switching ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 flex-shrink-0" />
            ) : (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={activeProfile.photo_url || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                  {activeProfile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm truncate">{activeProfile.name}</span>
                {activeProfile.is_shared && <Users className="h-3 w-3 text-blue-600 flex-shrink-0" />}
              </div>
              <div className="flex items-center space-x-2">
                {activeProfile.birth_date && (
                  <span className="text-xs text-gray-500">
                    {calculateAge(activeProfile.birth_date)}
                  </span>
                )}
                <Badge className={`text-xs ${getRoleColor(activeProfile.user_role || 'owner')}`}>
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {activeProfile.user_role || 'owner'}
                </Badge>
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[65vh] overflow-y-auto z-[60]">
        <SheetHeader>
          <SheetTitle>Child Profiles</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3">
          {profiles.map((profile) => {
            const ProfileRoleIcon = getRoleIcon(profile.user_role || 'owner');
            return (
              <Button
                key={profile.id}
                variant="ghost"
                className="w-full h-auto p-4 justify-start"
                onClick={() => handleProfileSwitch(profile.id)}
                disabled={switching}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.photo_url || undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{profile.name}</span>
                      {profile.is_shared && <Users className="h-3 w-3 text-blue-600" />}
                      {profile.is_active && !profile.is_shared && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {profile.birth_date && (
                        <span className="text-sm text-gray-500">
                          {calculateAge(profile.birth_date)}
                        </span>
                      )}
                      <Badge className={`text-xs ${getRoleColor(profile.user_role || 'owner')}`}>
                        <ProfileRoleIcon className="h-3 w-3 mr-1" />
                        {profile.user_role || 'owner'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
          
          <div className="pt-4 border-t space-y-2">
            <Button onClick={handleAddProfile} className="w-full" disabled={switching}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Profile
            </Button>
            
            <Button onClick={handleManageProfiles} variant="outline" className="w-full" disabled={switching}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Profiles
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
