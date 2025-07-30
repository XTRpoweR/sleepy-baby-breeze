
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  MessageCircle,
  Moon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MessagesContainer } from '@/components/messages/MessagesContainer';
import { PermissionAwareActions } from '@/components/tracking/PermissionAwareActions';

const Messages = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, createProfile } = useBabyProfile();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Moon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="mb-3 sm:mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base touch-target"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{t('navigation.back')}</span>
          </Button>
          
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-tight">
                  Family Messages
                </h1>
              </div>
              {/* Mobile Language Selector */}
              <div className="sm:hidden">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>

        {!profile ? (
          <PermissionAwareActions requiredPermission="canEdit">
            <div className="text-center mb-6 sm:mb-8 px-2 sm:px-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                Set up your baby profile first
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Create a baby profile to start messaging with family members about your little one.
              </p>
              <div className="max-w-sm sm:max-w-md mx-auto">
                <BabyProfileSetup onProfileCreated={createProfile} />
              </div>
            </div>
          </PermissionAwareActions>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center sm:text-left px-2 sm:px-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                Messages for {profile.name}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                Stay connected with family members. Share quick updates, ask questions, and coordinate care for {profile.name}.
              </p>
            </div>

            <div className="px-1 sm:px-0">
              <MessagesContainer babyId={profile.id} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
