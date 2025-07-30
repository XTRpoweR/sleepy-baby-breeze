import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  BarChart3, 
  Camera, 
  Moon,
  MessageCircle,
  User,
  LogOut,
  Zap,
  Crown,
  Plus,
  ArrowRight,
  Baby
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { PermissionAwareActions } from '@/components/tracking/PermissionAwareActions';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading, createProfile } = useBabyProfile();
  const { role } = useProfilePermissions(profile?.id || null);
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
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Baby className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-tight">
                  {t('pages.dashboard.welcome')}
                </h1>
              </div>
              {/* Mobile Language Selector */}
              <div className="sm:hidden">
                <LanguageSelector />
              </div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              {t('pages.dashboard.trackMessage')}
            </p>
          </div>
        </div>

        {!profile ? (
          <PermissionAwareActions requiredPermission="canEdit">
            <div className="text-center mb-6 sm:mb-8 px-2 sm:px-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                {t('pages.dashboard.setupFirst')}
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                {t('pages.dashboard.setupMessage')}
              </p>
              <div className="max-w-sm sm:max-w-md mx-auto">
                <BabyProfileSetup onProfileCreated={createProfile} />
              </div>
            </div>
          </PermissionAwareActions>
        ) : (
          <>
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 touch-target"
                onClick={() => navigate('/track-activity')}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="text-blue-900">Track</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm text-blue-700">Log activities</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 touch-target"
                onClick={() => navigate('/reports')}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    <span className="text-purple-900">Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm text-purple-700">View insights</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200 touch-target"
                onClick={() => navigate('/messages')}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="text-green-900">Messages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm text-green-700">Family chat</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 touch-target"
                onClick={() => navigate('/memories')}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    <span className="text-amber-900">Memories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm text-amber-700">Photos & videos</p>
                </CardContent>
              </Card>
            </div>

            {/* Settings and Account Management */}
            <div className="border-t pt-4 sm:pt-6 lg:pt-8">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {t('pages.dashboard.settings')}
                </h2>
                <div className="hidden sm:block">
                  {/* Desktop Language Selector */}
                  <LanguageSelector />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card className="touch-target">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      {t('pages.dashboard.profile')}
                    </CardTitle>
                    <User className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{t('pages.dashboard.profileMessage')}</p>
                    <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => navigate('/account')}>
                      {t('pages.dashboard.manage')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="touch-target">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      {t('pages.dashboard.familySharing')}
                    </CardTitle>
                    <Crown className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{t('pages.dashboard.familyMessage')}</p>
                    <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => navigate('/family-sharing')}>
                      {t('pages.dashboard.manage')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="touch-target">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      {t('pages.dashboard.subscription')}
                    </CardTitle>
                    <Zap className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{t('pages.dashboard.subscriptionMessage')}</p>
                    <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => navigate('/subscription')}>
                      {t('pages.dashboard.manage')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="touch-target">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      {t('pages.dashboard.notifications')}
                    </CardTitle>
                    <Plus className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{t('pages.dashboard.notificationMessage')}</p>
                    <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => navigate('/notifications')}>
                      {t('pages.dashboard.manage')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer with Sign Out */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 border-t mt-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full sm:w-auto flex items-center space-x-2 text-gray-600 hover:text-gray-900 touch-target"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('pages.dashboard.signOut')}</span>
        </Button>
      </footer>
    </div>
  );
};

export default Dashboard;
