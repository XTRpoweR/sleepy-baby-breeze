
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
import { Baby, ChevronDown, Plus, Settings, Loader2 } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';

interface MobileProfileSelectorProps {
  onAddProfile: () => void;
  onManageProfiles: () => void;
}

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
              <div className="font-medium text-sm truncate">{activeProfile.name}</div>
              {activeProfile.birth_date && (
                <div className="text-xs text-gray-500">
                  {calculateAge(activeProfile.birth_date)}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>Child Profiles</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3">
          {profiles.map((profile) => (
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
            </Button>
          ))}
          
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
