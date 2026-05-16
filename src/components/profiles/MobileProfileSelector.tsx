
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Baby } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { MobileProfileModal } from './MobileProfileModal';

interface BabyProfile {
  id: string;
  name: string;
  birth_date?: string | null;
  photo_url?: string | null;
  is_shared?: boolean;
  user_role?: string;
}

interface MobileProfileSelectorProps {
  activeProfile?: BabyProfile | null;
  switching?: boolean;
  profiles?: BabyProfile[];
  switchProfile?: (profileId: string) => Promise<boolean>;
}

export const MobileProfileSelector = ({
  activeProfile: propActiveProfile, 
  switching: propSwitching, 
  profiles: propProfiles, 
  switchProfile: propSwitchProfile 
}: MobileProfileSelectorProps = {}) => {
  const { profiles: hookProfiles, activeProfile: hookActiveProfile, switching: hookSwitching, switchProfile: hookSwitchProfile } = useBabyProfile();
  const [showModal, setShowModal] = useState(false);

  // Use props if provided, otherwise use hook values
  const activeProfile = propActiveProfile || hookActiveProfile;
  const switching = propSwitching !== undefined ? propSwitching : hookSwitching;
  const profiles = propProfiles || hookProfiles;
  const switchProfile = propSwitchProfile || hookSwitchProfile;

  if (!activeProfile) {
    console.log('No active profile, not rendering MobileProfileSelector');
    return null;
  }

  return (
    <>
      <button
        disabled={switching}
        onClick={() => setShowModal(true)}
        className="relative w-full max-w-md bg-white/85 border border-white/90 rounded-3xl p-4 transition-transform active:scale-[0.98] disabled:opacity-50 touch-manipulation"
        style={{
          boxShadow: '0 8px 24px -8px rgba(168, 85, 247, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent rounded-t-3xl" />
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring glow */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 blur-[3px] opacity-50" />
            <Avatar className="relative h-12 w-12 rounded-2xl ring-2 ring-white">
              <AvatarImage src={activeProfile.photo_url || ''} className="rounded-2xl" />
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                <Baby className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="font-bold text-sm text-gray-900 truncate">{activeProfile.name}</div>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
            </div>
            <div className="text-xs text-gray-500">
              {profiles.length} profile{profiles.length !== 1 ? 's' : ''} · Active
            </div>
          </div>

          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </button>

      <MobileProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        switchProfile={switchProfile}
        activeProfile={activeProfile}
        switching={switching}
        profiles={profiles}
      />
    </>
  );
};
