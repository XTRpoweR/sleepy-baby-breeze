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
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { QuickLogCard } from '@/components/quick-log/QuickLogCard';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { activeProfile, profiles } = useBabyProfile();
  const { subscriptionTier, isPremium, openCustomerPortal, checkSubscription } = useSubscription();
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
    openCustomerPortal();
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              
              {/* Subscription Status */}
              <div className="flex items-center space-x-2">
                {isPremium ? (
                  <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    <Crown className="h-4 w-4" />
                    <span>Premium</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    <Baby className="h-4 w-4" />
                    <span>Basic</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManageSubscription}
                  className="flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Manage</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('navigation.signOut')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userName ? t('dashboard.welcome', { name: userName }) : t('dashboard.welcomeFallback')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('dashboard.subtitle')}
          </p>
          
          {/* Profile Selector */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">{t('dashboard.childProfiles')}</h2>
            <ProfileSelector 
              onAddProfile={handleAddProfile}
              onManageProfiles={handleManageProfiles}
            />
            {!isPremium && profiles.length >= 1 && (
              <p className="text-sm text-orange-600 mt-2 flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                Upgrade to Premium for unlimited baby profiles
              </p>
            )}
          </div>
        </div>

        {/* Subscription Plans */}
        {!isPremium && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Plan</h2>
            <SubscriptionPlans />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleTrackActivity}>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.trackActivities')}</h3>
              <p className="text-sm text-gray-600">{t('dashboard.trackActivitiesDesc')}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSleepSchedule}>
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Moon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.sleepSchedule')}</h3>
              <p className="text-sm text-gray-600">{t('dashboard.sleepScheduleDesc')}</p>
            </CardContent>
          </Card>

          <QuickLogCard />

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer relative" 
            onClick={handleFamilySharing}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.familySharing')}</h3>
              <p className="text-sm text-gray-600">{t('dashboard.familySharingDesc')}</p>
              {!isPremium && (
                <div className="absolute top-2 right-2">
                  <Crown className="h-4 w-4 text-orange-500" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewReports}>
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.viewReports')}</h3>
              <p className="text-sm text-gray-600 mb-3">{t('dashboard.viewReportsDesc')}</p>
              <div className="space-y-2 text-xs text-gray-500">
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Baby className="h-5 w-5 text-blue-600" />
                <span>{t('dashboard.todaysActivity')}</span>
                {activeProfile && (
                  <span className="text-sm font-normal text-gray-600">
                    for {activeProfile.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeProfile ? (
                <div className="text-center py-8">
                  <Moon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.startTracking')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('dashboard.noDataMessage', { name: activeProfile.name })}
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleTrackActivity}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.startTracking')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.createProfile')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('dashboard.noProfileMessage')}
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddProfile}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.addProfile')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>{t('dashboard.weekOverview')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0h 0m</div>
                <div className="text-sm text-gray-600">{t('dashboard.averageSleep')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">{t('dashboard.feedings')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">{t('dashboard.diaperChanges')}</div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  {activeProfile 
                    ? t('dashboard.noDataMessage', { name: activeProfile.name })
                    : t('dashboard.noProfileMessage')
                  }
                </p>
              </div>
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
