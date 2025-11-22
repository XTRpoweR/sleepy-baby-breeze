import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { NewUserOnboarding } from '@/components/onboarding/NewUserOnboarding';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';

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
    switchProfile,
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
  } = useDashboardStats(activeProfile?.id);
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
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

  if (loading || profilesLoading || subscriptionLoading) {
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
        <UnifiedHeader />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
          <NewUserOnboarding onProfileCreated={handleProfileCreated} onSkip={handleSkipOnboarding} />
        </main>
      </div>;
  }

  // Show profile creation form if requested
  if (showProfileCreation) {
    return <div className="min-h-screen bg-soft gradient-dynamic-slow">
        <UnifiedHeader />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
          <BabyProfileSetup onProfileCreated={handleProfileCreated} showBackButton={true} onBack={() => setShowProfileCreation(false)} />
        </main>
      </div>;
  }
  
  const userName = user.user_metadata?.full_name?.split(' ')[0];

  // Unified rendering for all devices
  return (
    <div className="min-h-screen bg-soft gradient-dynamic-slow">
      <UnifiedHeader />
      <UnifiedDashboard
        user={user}
        userName={userName}
        isNewUser={isNewUser}
        isPremium={isPremium}
        profiles={profiles}
        activeProfile={activeProfile}
        switchProfile={switchProfile}
        switching={switching}
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
};

export default Dashboard;