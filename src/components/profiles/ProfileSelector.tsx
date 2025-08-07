
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Baby, ChevronDown, Plus, Settings, Loader2, Users, Crown, Heart, Shield } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';

interface ProfileSelectorProps {
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

export const ProfileSelector = ({ onAddProfile, onManageProfiles }: ProfileSelectorProps) => {
  const { activeProfile, profiles, switching, switchProfile } = useBabyProfile();
  const { role } = useProfilePermissions(activeProfile?.id || null);
  const [switchingProfileId, setSwitchingProfileId] = useState<string | null>(null);

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
    console.log('Profile switch requested for:', profileId);
    setSwitchingProfileId(profileId);
    
    try {
      const success = await switchProfile(profileId);
      if (success) {
        console.log('Profile switch successful');
      }
    } catch (error) {
      console.error('Profile switch failed:', error);
    } finally {
      setSwitchingProfileId(null);
    }
  };

  if (!activeProfile) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No Child Profiles</h3>
          <p className="text-gray-600 mb-4">Create your first child profile to get started</p>
          <Button onClick={onAddProfile} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Child Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  const RoleIcon = getRoleIcon(activeProfile.user_role || 'owner');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-auto p-3 justify-between min-w-[200px]" disabled={switching}>
          <div className="flex items-center space-x-3">
            {switching ? (
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            ) : (
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeProfile.photo_url || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {activeProfile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{activeProfile.name}</span>
                {activeProfile.is_shared && <Users className="h-3 w-3 text-blue-600" />}
              </div>
              <div className="flex items-center space-x-2">
                {activeProfile.birth_date && (
                  <span className="text-sm text-gray-500">
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
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="start">
        <div className="p-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Child Profiles</div>
          {profiles.map((profile) => {
            const ProfileRoleIcon = getRoleIcon(profile.user_role || 'owner');
            const isCurrentlySwitching = switchingProfileId === profile.id;
            const isCurrentProfile = activeProfile?.id === profile.id;
            
            return (
              <DropdownMenuItem
                key={profile.id}
                className="p-3 cursor-pointer"
                onClick={() => handleProfileSwitch(profile.id)}
                disabled={switching || isCurrentlySwitching || isCurrentProfile}
              >
                <div className="flex items-center space-x-3 w-full">
                  {isCurrentlySwitching ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.photo_url || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{profile.name}</span>
                      {profile.is_shared && <Users className="h-3 w-3 text-blue-600" />}
                      {isCurrentProfile && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
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
              </DropdownMenuItem>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Add New Profile - Only show for owners */}
        {role === 'owner' && (
          <DropdownMenuItem onClick={onAddProfile} className="p-3 cursor-pointer" disabled={switching}>
            <Plus className="h-4 w-4 mr-3" />
            Add New Profile
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={onManageProfiles} className="p-3 cursor-pointer" disabled={switching}>
          <Settings className="h-4 w-4 mr-3" />
          Manage Profiles
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
