
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Moon, 
  Clock, 
  Calendar, 
  BarChart3, 
  User,
  LogOut,
  Baby,
  Plus,
  TrendingUp,
  Activity,
  Users,
  Crown,
  Settings,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { QuickLogCard } from '@/components/quick-log/QuickLogCard';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { MobileProfileSelector } from '@/components/profiles/MobileProfileSelector';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { activeProfile, profiles } = useBabyProfile();
  const { subscriptionTier, isPremium, openCustomerPortal, checkSubscription } = useSubscription();
  const { stats, loading: statsLoading, hasActiveProfile } = useDashboardStats();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<'profiles' | 'history' | 'sharing' | 'reports' | 'sounds'>('profiles');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check for success/canceled URL params and refresh subscription
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      console.log('Payment successful, checking subscription...');
      checkSubscription();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('canceled') === 'true') {
      console.log('Payment canceled');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkSubscription]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleTrackActivity = () => {
    navigate('/track');
  };

  const handleSleepSchedule = () => {
    navigate('/sleep-schedule');
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleFamilySharing = () => {
    if (!isPremium) {
      setUpgradeFeature('sharing');
      setShowUpgradePrompt(true);
      return;
    }
    navigate('/family');
  };

  const handleAddProfile = () => {
    if (!isPremium && profiles.length >= 1) {
      setUpgradeFeature('profiles');
      setShowUpgradePrompt(true);
      return;
    }
    setShowProfileManagement(true);
  };

  const handleManageProfiles = () => {
    setShowProfileManagement(true);
  };

  const handleManageSubscription = () => {
    if (isPremium) {
      openCustomerPortal();
    } else {
      navigate('/subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Moon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.full_name?.split(' ')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {userName ? t('dashboard.welcome', { name: userName }) : t('dashboard.welcomeFallback')}
          </h1>
          <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
            {t('dashboard.subtitle')}
          </p>
          
          {/* Profile Selector */}
          <div className="mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-3">{t('dashboard.childProfiles')}</h2>
            
            {/* Desktop Profile Selector */}
            <div className="hidden lg:block">
              <ProfileSelector 
                onAddProfile={handleAddProfile}
                onManageProfiles={handleManageProfiles}
              />
            </div>
            
            {/* Mobile Profile Selector */}
            <div className="lg:hidden">
              <MobileProfileSelector 
                onAddProfile={handleAddProfile}
                onManageProfiles={handleManageProfiles}
              />
            </div>
            
            {!isPremium && profiles.length >= 1 && (
              <p className="text-xs lg:text-sm text-orange-600 mt-2 flex items-center">
                <Crown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                Upgrade to Premium for unlimited baby profiles
              </p>
            )}
          </div>
        </div>

        {/* Upgrade Banner for Basic Users */}
        {!isPremium && (
          <Card className="mb-6 lg:mb-8 border-2 border-dashed border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start lg:items-center space-x-3 lg:space-x-4">
                  <div className="bg-orange-100 rounded-full p-2 lg:p-3 flex-shrink-0">
                    <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1">
                      Unlock Premium Features
                    </h3>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Get unlimited profiles, extended history, family sharing, and more for just $9.99/month
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/subscription')}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center justify-center space-x-2 w-full lg:w-auto"
                  size="sm"
                >
                  <Crown className="h-4 w-4" />
                  <span>View Plans</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleTrackActivity}>
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="bg-blue-100 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{t('dashboard.trackActivities')}</h3>
              <p className="text-xs lg:text-sm text-gray-600">{t('dashboard.trackActivitiesDesc')}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSleepSchedule}>
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="bg-purple-100 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Moon className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{t('dashboard.sleepSchedule')}</h3>
              <p className="text-xs lg:text-sm text-gray-600">{t('dashboard.sleepScheduleDesc')}</p>
            </CardContent>
          </Card>

          <div className="sm:col-span-2 lg:col-span-1">
            <QuickLogCard />
          </div>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer relative" 
            onClick={handleFamilySharing}
          >
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="bg-green-100 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{t('dashboard.familySharing')}</h3>
              <p className="text-xs lg:text-sm text-gray-600">{t('dashboard.familySharingDesc')}</p>
              {!isPremium && (
                <div className="absolute top-2 right-2">
                  <Crown className="h-3 w-3 lg:h-4 lg:w-4 text-orange-500" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1" onClick={handleViewReports}>
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="bg-orange-100 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{t('dashboard.viewReports')}</h3>
              <p className="text-xs lg:text-sm text-gray-600 mb-3">{t('dashboard.viewReportsDesc')}</p>
              <div className="space-y-1 lg:space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>{t('dashboard.dailySleep')}</span>
                  <span>{t('dashboard.trackPatterns')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('dashboard.feedingData')}</span>
                  <span>{t('dashboard.monitorFrequency')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('dashboard.weeklyTrends')}</span>
                  <span>{t('dashboard.visualCharts')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Today's Summary */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                <Baby className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                <span>{t('dashboard.todaysActivity')}</span>
                {activeProfile && (
                  <span className="text-xs lg:text-sm font-normal text-gray-600">
                    for {activeProfile.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeProfile ? (
                <div className="text-center py-6 lg:py-8">
                  <Moon className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-3 lg:mb-4" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">{t('dashboard.startTracking')}</h3>
                  <p className="text-gray-600 mb-4 text-sm lg:text-base">
                    {t('dashboard.noDataMessage', { name: activeProfile.name })}
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={handleTrackActivity}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.startTracking')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 lg:py-8">
                  <Baby className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-3 lg:mb-4" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">{t('dashboard.createProfile')}</h3>
                  <p className="text-gray-600 mb-4 text-sm lg:text-base">
                    {t('dashboard.noProfileMessage')}
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={handleAddProfile}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.addProfile')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                <span>{t('dashboard.weekOverview')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                </div>
              ) : hasActiveProfile ? (
                <>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">{stats.weeklyAverageSleep}</div>
                    <div className="text-xs lg:text-sm text-gray-600">{t('dashboard.averageSleep')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">{stats.weeklyFeedings}</div>
                    <div className="text-xs lg:text-sm text-gray-600">{t('dashboard.feedings')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">{stats.weeklyDiaperChanges}</div>
                    <div className="text-xs lg:text-sm text-gray-600">{t('dashboard.diaperChanges')}</div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      Data from this week (Monday-Sunday)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">0h 0m</div>
                    <div className="text-xs lg:text-sm text-gray-600">{t('dashboard.averageSleep')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">0</div>
                    <div className="text-xs lg:text-sm text-gray-600">{t('dashboard.feedings')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">0</div>
                    <div className="text-xs lg:text-sm text-gray-600">{t('dashboard.diaperChanges')}</div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      {t('dashboard.noProfileMessage')}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Profile Management Dialog */}
      <ProfileManagementDialog 
        isOpen={showProfileManagement}
        onClose={() => setShowProfileManagement(false)}
      />

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={upgradeFeature}
      />
    </div>
  );
};

export default Dashboard;
