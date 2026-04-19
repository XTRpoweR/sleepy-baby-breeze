import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Baby, Settings, Check, Sparkles } from 'lucide-react';
import { ProfileManagementDialog } from './ProfileManagementDialog';
import { formatLocalizedDate, formatAge } from '@/utils/dateLocalization';

interface BabyProfile {
  id: string;
  name: string;
  birth_date?: string | null;
  photo_url?: string | null;
  is_shared?: boolean;
  user_role?: string;
}

interface MobileProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  switchProfile: (profileId: string) => Promise<boolean>;
  activeProfile: BabyProfile | null;
  switching: boolean;
  profiles: BabyProfile[];
}

export const MobileProfileModal = ({ isOpen, onClose, profiles, activeProfile, switching, switchProfile }: MobileProfileModalProps) => {
  const { i18n } = useTranslation();
  const [showManagement, setShowManagement] = useState(false);
  const locale = i18n.language || 'en';

  const handleProfileSwitch = async (profileId: string) => {
    if (activeProfile?.id === profileId) {
      onClose();
      return;
    }
    const success = await switchProfile(profileId);
    if (success) onClose();
  };

  const handleManageProfiles = () => {
    onClose();
    setTimeout(() => setShowManagement(true), 100);
  };

  const getRoleLabel = (profile: BabyProfile) => {
    if (!profile.is_shared) return 'Owner';
    if (profile.user_role === 'viewer') return 'Viewer';
    if (profile.user_role === 'caregiver') return 'Caregiver';
    return 'Shared';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="w-[95vw] max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl"
          style={{
            position: 'fixed',
            top: '5vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
        >
          {/* Header with gradient */}
          <DialogHeader className="p-5 pb-4 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex-shrink-0">
            <DialogTitle className="flex items-center space-x-3 text-white">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                <Baby className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-lg font-semibold">Child Profiles</div>
                <div className="text-xs text-white/80 font-normal mt-0.5">
                  {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} · Tap to switch
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Profiles list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-gray-50 to-white min-h-0">
            {profiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Baby className="h-8 w-8 text-purple-300" />
                </div>
                <p className="text-sm">No profiles found</p>
              </div>
            ) : (
              profiles.map((profile) => {
                const isActive = activeProfile?.id === profile.id;
                return (
                  <button
                    key={profile.id}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all touch-manipulation ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-sm ring-2 ring-purple-200'
                        : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md active:scale-[0.99]'
                    }`}
                    onClick={() => handleProfileSwitch(profile.id)}
                    disabled={switching}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className={`h-14 w-14 ${isActive ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}>
                        <AvatarImage src={profile.photo_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
                          <Baby className="h-7 w-7" />
                        </AvatarFallback>
                      </Avatar>
                      {isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 ring-2 ring-white">
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base text-gray-900 truncate">{profile.name}</h3>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Active
                          </span>
                        )}
                      </div>

                      {profile.birth_date && (
                        <div className="text-xs text-purple-600 font-medium mb-0.5">
                          {formatAge(profile.birth_date, locale)}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                        {profile.birth_date && (
                          <span dir="ltr" className="tabular-nums">
                            {formatLocalizedDate(profile.birth_date, 'd MMM yyyy', locale)}
                          </span>
                        )}
                        {profile.birth_date && (
                          <span className="text-gray-300">·</span>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-4 font-normal ${
                            profile.is_shared
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : 'border-purple-200 bg-purple-50 text-purple-700'
                          }`}
                        >
                          {getRoleLabel(profile)}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer button */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            <Button
              onClick={handleManageProfiles}
              className="w-full flex items-center justify-center gap-2 h-12 text-base touch-manipulation bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-md hover:shadow-lg"
            >
              <div className="bg-white/20 p-1 rounded-full">
                <Settings className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Manage Profiles</span>
              <Sparkles className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileManagementDialog
        open={showManagement}
        onOpenChange={setShowManagement}
      />
    </>
  );
};
