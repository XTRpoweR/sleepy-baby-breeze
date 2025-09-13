import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Clock, Calendar, BarChart3, User, LogOut, Baby, Plus, TrendingUp, Activity, Users, Crown, Settings, ArrowRight, Sparkles, GraduationCap, Camera, FileText, Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { QuickLogCard } from '@/components/quick-log/QuickLogCard';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { MobileProfileSelector } from '@/components/profiles/MobileProfileSelector';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { NewUserOnboarding } from '@/components/onboarding/NewUserOnboarding';
import { LanguageSelector } from '@/components/LanguageSelector';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';

const Dashboard = () => {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const {
    activeProfile,
    profiles,
    createProfile,
    switching,
    loading: profilesLoading
  } = useBabyProfile();
  const {
    subscriptionTier,
    isPremium,
    loading: subscriptionLoading,
    openCustomerPortal,
    checkSubscription
  } = useSubscription();
  const {
    stats,
    loading: statsLoading,
    hasActiveProfile
  } = useDashboardStats();
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const isMobile = useIsMobile();
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showNewUserOnboarding, setShowNewUserOnboarding] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<'profiles' | 'history' | 'sharing' | 'reports' | 'sounds' | 'memories' | 'pediatrician' | 'notifications'>('profiles');

  // Check if user is truly new (no profiles and no family memberships) - only when profiles are loaded
  const isNewUser = !profilesLoading && profiles.length === 0;
  
  // Track if we're in a switching state (either profile switching or stats loading)
  const isDataLoading = switching || statsLoading;

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
  const handleMemories = () => {
    if (!isPremium) {
      setUpgradeFeature('memories');
      setShowUpgradePrompt(true);
      return;
    }
    navigate('/memories');
  };
  const handleAddProfile = () => {
    console.log('Add profile clicked - Current profiles:', profiles.length, 'isPremium:', isPremium);

    // Check if user has reached profile limit
    const ownedProfiles = profiles.filter(p => !p.is_shared);
    if (!isPremium && ownedProfiles.length >= 1) {
      console.log('Profile limit reached for basic user');
      setUpgradeFeature('profiles');
      setShowUpgradePrompt(true);
      return;
    }

    // Show profile creation form
    setShowProfileCreation(true);
  };
  const handleManageProfiles = () => {
    setShowProfileManagement(true);
  };
  const handleProfileCreated = async (profileData: {
    name: string;
    birth_date?: string;
    photo_url?: string;
  }) => {
    console.log('Creating profile with data:', profileData);
    const success = await createProfile(profileData);
    if (success) {
      setShowProfileCreation(false);
      setShowNewUserOnboarding(false);
    }
    return success;
  };
  const handleSkipOnboarding = () => {
    setShowNewUserOnboarding(false);
  };
  const handleManageSubscription = () => {
    if (isPremium) {
      openCustomerPortal();
    } else {
      navigate('/subscription');
    }
  };
  const handlePediatricianReports = () => {
    if (!isPremium) {
      setUpgradeFeature('pediatrician');
      setShowUpgradePrompt(true);
      return;
    }
    navigate('/pediatrician-reports');
  };
  const handleNotifications = () => {
    if (!isPremium) {
      setUpgradeFeature('notifications');
      setShowUpgradePrompt(true);
      return;
    }
    navigate('/notifications');
  };
  const handleContact = () => {
    navigate('/contact');
  };

  const handleUpgrade = (feature: string) => {
    setUpgradeFeature(feature as any);
    setShowUpgradePrompt(true);
  };

  if (loading || profilesLoading) {
    return <div className="min-h-screen bg-soft gradient-dynamic-slow flex items-center justify-center">
        <div className="text-center">
          <Moon className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>;
  }
  if (!user) {
    return null;
  }

  // Show new user onboarding if requested
  if (showNewUserOnboarding && isNewUser) {
    return <div className="min-h-screen bg-soft gradient-dynamic-slow">
        <DesktopHeader />
        <MobileHeader />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
          <NewUserOnboarding onProfileCreated={handleProfileCreated} onSkip={handleSkipOnboarding} />
        </main>
      </div>;
  }

  // Show profile creation form if requested
  if (showProfileCreation) {
    return <div className="min-h-screen bg-soft gradient-dynamic-slow">
        <DesktopHeader />
        <MobileHeader />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
          <BabyProfileSetup onProfileCreated={handleProfileCreated} showBackButton={true} onBack={() => setShowProfileCreation(false)} />
        </main>
      </div>;
  }
  const userName = user.user_metadata?.full_name?.split(' ')[0];

  // Mobile-specific rendering
  if (isMobile) {
    return (
      <div className="min-h-screen bg-soft gradient-dynamic-slow">
        <MobileHeader />
        <MobileDashboard
          user={user}
          userName={userName}
          isNewUser={isNewUser}
          isPremium={isPremium}
          profiles={profiles}
          stats={stats}
          isDataLoading={isDataLoading}
          showProfileCreation={showProfileCreation}
          onTrackActivity={handleTrackActivity}
          onSleepSchedule={handleSleepSchedule}
          onViewReports={handleViewReports}
          onFamilySharing={handleFamilySharing}
          onMemories={handleMemories}
          onAddProfile={handleAddProfile}
          onManageProfiles={handleManageProfiles}
          onProfileCreated={handleProfileCreated}
          onManageSubscription={handleManageSubscription}
          onPediatricianReports={handlePediatricianReports}
          onNotifications={handleNotifications}
          onContact={handleContact}
          onSetShowProfileCreation={setShowProfileCreation}
          onUpgrade={handleUpgrade}
        />
        
        {/* Dialogs */}
        <ProfileManagementDialog
          open={showProfileManagement}
          onOpenChange={setShowProfileManagement}
        />
        <UpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          feature={upgradeFeature}
        />
      </div>
    );
  }

  // Desktop rendering (unchanged)
  return <div className="min-h-screen bg-soft gradient-dynamic-slow">
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-1 lg:py-2">
        {/* Welcome Section */}
        <div className="mb-3 lg:mb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                {userName ? t('dashboard.welcome', {
                name: userName
              }) : t('dashboard.welcomeFallback')}
              </h1>
              <p className="text-muted-foreground mb-2 lg:mb-3 text-sm lg:text-base">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Profile Selector or Create Profile Section */}
          {!isNewUser ? (
            <div className="mb-2 lg:mb-3">
              <h2 className="text-base lg:text-lg font-medium text-foreground mb-1 lg:mb-2">{t('dashboard.childProfiles')}</h2>
              
              {/* Desktop Profile Selector */}
              <div className="hidden md:block">
                <ProfileSelector />
              </div>
              
              {/* Mobile Profile Selector */}
              <div className="md:hidden">
                <MobileProfileSelector />
              </div>
              
              {!subscriptionLoading && !isPremium && <p className="text-xs lg:text-sm text-warning mt-1 flex items-center">
                  <Crown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  Upgrade to Premium for unlimited baby profiles
                </p>}
            </div>
          ) : (
            <Card className="mb-3 lg:mb-4 border-2 border-dashed border-info/20 bg-gradient-to-r from-info/5 to-info/10">
              <CardContent className="p-4 lg:p-6 text-center">
                <div className="bg-info/20 rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <Baby className="h-8 w-8 lg:h-10 lg:w-10 text-info" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">
                  {t('dashboard.createProfile')}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm lg:text-base max-w-md mx-auto">
                  {t('dashboard.noProfileMessage')}
                </p>
                <Button 
                  className="bg-info hover:bg-info/90 text-white px-6 py-2 lg:px-8 lg:py-3 text-sm lg:text-base" 
                  onClick={handleAddProfile}
                >
                  <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  {t('dashboard.addProfile')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upgrade Banner for Basic Users */}
        {!subscriptionLoading && !isPremium && <Card className="mb-3 lg:mb-4 border-2 border-dashed border-warning/20 bg-gradient-to-r from-warning/5 to-warning/10 card-glow">
            <CardContent className="p-2 lg:p-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                <div className="flex items-start lg:items-center space-x-2">
                  <div className="bg-warning/20 rounded-full p-1.5 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm lg:text-base font-semibold text-foreground mb-0.5">
                      Unlock Premium Features
                    </h3>
                    <p className="text-muted-foreground text-xs lg:text-sm">
                      Get unlimited profiles, extended history, family sharing, and more for just $29.99/month
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/subscription')} variant="warning" className="flex items-center justify-center space-x-2 w-full lg:w-auto" size="sm">
                  <Crown className="h-4 w-4" />
                  <span>View Plans</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3 mb-3 lg:mb-4">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 card-glow" onClick={handleTrackActivity}>
            <CardContent className="p-2 lg:p-3 text-center">
              <div className="bg-info/20 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center mx-auto mb-1 lg:mb-2 transition-transform duration-300 hover:scale-110">
                <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-info" />
              </div>
              <h3 className="font-semibold text-foreground mb-0.5 text-xs lg:text-sm">{t('dashboard.trackActivities')}</h3>
              <p className="text-xs text-muted-foreground">{t('dashboard.trackActivitiesDesc')}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 card-glow" onClick={handleSleepSchedule}>
            <CardContent className="p-2 lg:p-3 text-center">
              <div className="bg-primary/20 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center mx-auto mb-1 lg:mb-2 transition-transform duration-300 hover:scale-110">
                <Moon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-0.5 text-xs lg:text-sm">{t('dashboard.sleepSchedule')}</h3>
              <p className="text-xs text-muted-foreground">{t('dashboard.sleepScheduleDesc')}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={handleNotifications}>
            <CardContent className="p-2 lg:p-3 text-center">
              <div className="bg-indigo-100 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center mx-auto mb-1 lg:mb-2">
                <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs lg:text-sm">Smart Notifications</h3>
              <p className="text-xs text-gray-600">Intelligent care reminders</p>
              {!subscriptionLoading && !isPremium && <div className="absolute top-1 right-1">
                  <Crown className="h-3 w-3 text-orange-500" />
                </div>}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={handleMemories}>
            <CardContent className="p-2 lg:p-3 text-center">
              <div className="bg-pink-100 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center mx-auto mb-1 lg:mb-2">
                <Camera className="h-4 w-4 lg:h-5 lg:w-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs lg:text-sm">Photo & Memories</h3>
              <p className="text-xs text-gray-600">Capture precious moments</p>
              {!subscriptionLoading && !isPremium && <div className="absolute top-1 right-1">
                  <Crown className="h-3 w-3 text-orange-500" />
                </div>}
            </CardContent>
          </Card>

          <div className="lg:col-span-1">
            <QuickLogCard />
          </div>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={handleFamilySharing}>
            <CardContent className="p-2 lg:p-3 text-center">
              <div className="bg-green-100 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center mx-auto mb-1 lg:mb-2">
                <Users className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs lg:text-sm">{t('dashboard.familySharing')}</h3>
              <p className="text-xs text-gray-600">{t('dashboard.familySharingDesc')}</p>
              {!subscriptionLoading && !isPremium && <div className="absolute top-1 right-1">
                  <Crown className="h-3 w-3 text-orange-500" />
                </div>}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={handlePediatricianReports}>
            <CardContent className="p-2 lg:p-3 text-center">
              <div className="bg-teal-100 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center mx-auto mb-1 lg:mb-2">
                <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs lg:text-sm">{t('dashboard.pediatricianReports')}</h3>
              <p className="text-xs text-gray-600">{t('dashboard.pediatricianReportsDesc')}</p>
              {!subscriptionLoading && !isPremium && <div className="absolute top-1 right-1">
                  <Crown className="h-3 w-3 text-orange-500" />
                </div>}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1" onClick={handleViewReports}>
            <CardContent className="p-2 lg:p-3 text-center">
              <div className="bg-orange-100 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center mx-auto mb-1 lg:mb-2">
                <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5 text-xs lg:text-sm">{t('dashboard.viewReports')}</h3>
              <p className="text-xs text-gray-600 mb-1">{t('dashboard.viewReportsDesc')}</p>
              <div className="space-y-0.5 text-xs text-gray-500">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3">
          {/* Today's Summary */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm lg:text-base">
                <Baby className="h-4 w-4 text-blue-600" />
                <span>{t('dashboard.todaysActivity')}</span>
                {activeProfile && <span className="text-xs font-normal text-gray-600">
                    for {activeProfile.name}
                  </span>}
                {isDataLoading && (
                  <div className="ml-2 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeProfile ? <div className="text-center py-3 lg:py-4">
                  <Moon className="h-10 w-10 lg:h-12 lg:w-12 text-gray-300 mx-auto mb-1 lg:mb-2" />
                  <h3 className="text-sm lg:text-base font-medium text-gray-900 mb-0.5">{t('dashboard.startTracking')}</h3>
                  <p className="text-gray-600 mb-2 text-xs lg:text-sm">
                    {t('dashboard.noDataMessage', {
                  name: activeProfile.name
                })}
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={handleTrackActivity} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.startTracking')}
                  </Button>
                </div> : <div className="text-center py-3 lg:py-4">
                  <Baby className="h-10 w-10 lg:h-12 lg:w-12 text-gray-300 mx-auto mb-1 lg:mb-2" />
                  <h3 className="text-sm lg:text-base font-medium text-gray-900 mb-0.5">No Profile Selected</h3>
                  <p className="text-gray-600 mb-2 text-xs lg:text-sm">
                    Select a child profile to view today's activity
                  </p>
                </div>}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm lg:text-base">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>{t('dashboard.weekOverview')}</span>
                {isDataLoading && (
                  <div className="ml-2 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isDataLoading ? <div className="space-y-2">
                  <div className="text-center">
                    <div className="h-5 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-5 bg-gray-200 rounded w-6 mx-auto mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-5 bg-gray-200 rounded w-6 mx-auto mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                  </div>
                </div> : hasActiveProfile ? <>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">{stats.weeklyAverageSleep}</div>
                    <div className="text-xs text-gray-600">{t('dashboard.averageSleep')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">{stats.weeklyFeedings}</div>
                    <div className="text-xs text-gray-600">{t('dashboard.feedings')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">{stats.weeklyDiaperChanges}</div>
                    <div className="text-xs text-gray-600">{t('dashboard.diaperChanges')}</div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      Data from this week (Monday-Sunday)
                    </p>
                  </div>
                </> : <>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">0h 0m</div>
                    <div className="text-xs text-gray-600">{t('dashboard.averageSleep')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">0</div>
                    <div className="text-xs text-gray-600">{t('dashboard.feedings')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-gray-900">0</div>
                    <div className="text-xs text-gray-600">{t('dashboard.diaperChanges')}</div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      {t('dashboard.noProfileMessage')}
                    </p>
                  </div>
                </>}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Profile Management Dialog */}
      <ProfileManagementDialog 
        open={showProfileManagement} 
        onOpenChange={setShowProfileManagement} 
      />

      {/* Upgrade Prompt */}
      <UpgradePrompt isOpen={showUpgradePrompt} onClose={() => setShowUpgradePrompt(false)} feature={upgradeFeature} />
    </div>;
};

export default Dashboard;
