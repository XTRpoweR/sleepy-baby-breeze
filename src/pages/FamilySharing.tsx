
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  User,
  LogOut,
  ArrowLeft,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { FamilySharing as FamilySharingComponent } from '@/components/family/FamilySharing';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';

const FamilySharing = () => {
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading, createProfile } = useBabyProfile();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
        <div className="mb-6 lg:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{t('navigation.back')}</span>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{t('pages.familySharing.title')}</span>
            </div>
            {/* Mobile Language Selector */}
            <div className="sm:hidden">
              <LanguageSelector />
            </div>
          </div>
        </div>

        {!profile ? (
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('pages.familySharing.setupFirst')}</h1>
            <p className="text-gray-600 mb-8 text-sm sm:text-base px-4">
              {t('pages.familySharing.setupMessage')}
            </p>
            <div className="max-w-md mx-auto">
              <BabyProfileSetup onProfileCreated={createProfile} />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 lg:mb-8 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t('pages.familySharing.sharingFor', { name: profile.name })}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base px-4 sm:px-0">
                {t('pages.familySharing.inviteMessage', { name: profile.name })}
              </p>
            </div>

            <FamilySharingComponent babyId={profile.id} />
          </div>
        )}
      </main>
    </div>
  );
};

export default FamilySharing;
