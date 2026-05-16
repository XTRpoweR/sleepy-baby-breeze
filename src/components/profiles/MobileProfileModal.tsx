import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Baby, Settings, Check, Sparkles, X } from 'lucide-react';
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
      <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
        <DialogPrimitive.Portal>
          {/* Camera-focus scrim: gentle blur + barely-visible tint, dashboard stays visible */}
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-[99] backdrop-blur-[3px] bg-white/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          />

          {/* Centered modal — sharp focus, lifted from blurred bg */}
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] z-[100] w-[95vw] max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl bg-white translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            style={{
              boxShadow:
                '0 25px 50px -12px rgba(168, 85, 247, 0.45), 0 10px 30px -10px rgba(236, 72, 153, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.5)',
            }}
          >
            <DialogPrimitive.Title className="sr-only">Switch profile</DialogPrimitive.Title>

            {/* Header with brand gradient */}
            <div className="relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500" />
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-pink-300/30 blur-2xl" />
              <div className="relative p-5 pb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                    <Baby className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Switch profile</h2>
                    <p className="text-xs text-white/80 mt-0.5">
                      {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} · tap to switch
                    </p>
                  </div>
                </div>
                <DialogPrimitive.Close className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0">
                  <X className="h-4 w-4 text-white" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </div>
            </div>

            {/* Profiles list — shows ~3 cards, scrolls if more */}
            <div className="overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-purple-50/30 to-white max-h-[300px]">
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
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all touch-manipulation ${
                        isActive
                          ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-purple-300 shadow-sm ring-2 ring-purple-200'
                          : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md active:scale-[0.99]'
                      }`}
                      onClick={() => handleProfileSwitch(profile.id)}
                      disabled={switching}
                    >
                      <div className="relative flex-shrink-0">
                        {isActive && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 blur-[2px] opacity-60" />
                        )}
                        <Avatar className={`relative h-14 w-14 ring-2 ring-white ${isActive ? 'rounded-2xl' : ''}`}>
                          <AvatarImage src={profile.photo_url || ''} className={isActive ? 'rounded-2xl' : ''} />
                          <AvatarFallback className={`bg-gradient-to-br from-pink-100 to-purple-100 text-purple-700 ${isActive ? 'rounded-2xl' : ''}`}>
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
                          {profile.birth_date && <span className="text-gray-300">·</span>}
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
            <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
              <Button
                onClick={handleManageProfiles}
                className="w-full flex items-center justify-center gap-2 h-12 text-base touch-manipulation bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-md shadow-purple-500/30 hover:shadow-lg rounded-2xl"
              >
                <div className="bg-white/20 p-1 rounded-full">
                  <Settings className="h-3.5 w-3.5" />
                </div>
                <span className="font-semibold">Manage Profiles</span>
                <Sparkles className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ProfileManagementDialog open={showManagement} onOpenChange={setShowManagement} />
    </>
  );
};
