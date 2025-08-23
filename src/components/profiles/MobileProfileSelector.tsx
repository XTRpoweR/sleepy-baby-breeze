
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Baby } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { MobileProfileModal } from './MobileProfileModal';

export const MobileProfileSelector = () => {
  const { profiles, activeProfile, switching, forceUpdateCounter } = useBabyProfile();
  const [showModal, setShowModal] = useState(false);

  // Debug logging for mobile component
  useEffect(() => {
    console.log('MobileProfileSelector updated:', {
      profilesCount: profiles.length,
      activeProfileName: activeProfile?.name,
      activeProfileId: activeProfile?.id,
      switching,
      forceUpdateCounter
    });
  }, [profiles, activeProfile, switching, forceUpdateCounter]);

  if (!activeProfile) {
    console.log('No active profile, not rendering MobileProfileSelector');
    return null;
  }

  console.log('Rendering MobileProfileSelector with active profile:', activeProfile.name);

  return (
    <>
      <Button 
        variant="ghost" 
        className="flex items-center space-x-2 p-2 h-auto justify-start w-full max-w-[200px] touch-manipulation"
        disabled={switching}
        onClick={() => {
          console.log('MobileProfileSelector button clicked');
          setShowModal(true);
        }}
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

      <MobileProfileModal 
        isOpen={showModal}
        onClose={() => {
          console.log('MobileProfileModal closing');
          setShowModal(false);
        }}
      />
    </>
  );
};
