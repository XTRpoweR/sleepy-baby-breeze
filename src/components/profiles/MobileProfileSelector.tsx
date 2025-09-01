
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Baby } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { MobileProfileModal } from './MobileProfileModal';

export const MobileProfileSelector = () => {
  const { profiles, activeProfile, switching } = useBabyProfile();
  const [showModal, setShowModal] = useState(false);

  // Debug logging
  console.log('MobileProfileSelector render:', { profiles, activeProfile, switching });

  if (!activeProfile) {
    console.log('No active profile, not rendering MobileProfileSelector');
    return null;
  }

  return (
    <>
      <Card 
        className="flex items-center space-x-4 p-6 rounded-3xl shadow-xl bg-gradient-to-br from-purple-50/50 to-purple-100/30 hover:shadow-2xl active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation max-w-[280px] w-full"
        onClick={() => setShowModal(true)}
      >
        <Avatar className="h-12 w-12">
          <AvatarImage src={activeProfile.photo_url || ''} />
          <AvatarFallback className="bg-purple-100 text-purple-700">
            <Baby className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 text-left">
          <div className="font-semibold text-base text-foreground truncate">{activeProfile.name}</div>
          <div className="text-sm text-muted-foreground">
            {profiles.length} profile{profiles.length !== 1 ? 's' : ''} • Tap to switch
          </div>
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      </Card>

      <MobileProfileModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
