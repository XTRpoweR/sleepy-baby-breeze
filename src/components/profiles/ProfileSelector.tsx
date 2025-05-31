
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
import { Baby, ChevronDown, Plus, Settings } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';

interface BabyProfile {
  id: string;
  name: string;
  birth_date: string | null;
  photo_url: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface ProfileSelectorProps {
  onAddProfile: () => void;
  onManageProfiles: () => void;
}

export const ProfileSelector = ({ onAddProfile, onManageProfiles }: ProfileSelectorProps) => {
  const { activeProfile, profiles, switchProfile } = useBabyProfile();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-auto p-3 justify-between min-w-[200px]">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activeProfile.photo_url || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {activeProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-medium">{activeProfile.name}</div>
              {activeProfile.birth_date && (
                <div className="text-sm text-gray-500">
                  {calculateAge(activeProfile.birth_date)}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="start">
        <div className="p-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Child Profiles</div>
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              className="p-3 cursor-pointer"
              onClick={() => handleProfileSwitch(profile.id)}
            >
              <div className="flex items-center space-x-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.photo_url || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{profile.name}</span>
                    {profile.is_active && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </div>
                  {profile.birth_date && (
                    <div className="text-sm text-gray-500">
                      {calculateAge(profile.birth_date)}
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onAddProfile} className="p-3 cursor-pointer">
          <Plus className="h-4 w-4 mr-3" />
          Add New Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onManageProfiles} className="p-3 cursor-pointer">
          <Settings className="h-4 w-4 mr-3" />
          Manage Profiles
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
