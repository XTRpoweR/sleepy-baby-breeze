import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Moon, Clock, Calendar, BarChart3, User, Baby, Plus, TrendingUp, 
  Activity, Users, Crown, ArrowRight, Sparkles, GraduationCap,
  Camera, FileText, Bell, MessageCircle, Zap, Milk, Shield 
} from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { QuickLogCard } from '@/components/quick-log/QuickLogCard';
import { MobileProfileSelector } from '@/components/profiles/MobileProfileSelector';
import { TabletProfileHub } from '@/components/profiles/TabletProfileHub';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';

interface UnifiedDashboardProps {
  user: any;
  userName?: string;
  isNewUser: boolean;
  isPremium: boolean;
  profiles: any[];
  stats: any;
  isDataLoading: boolean;
  showProfileCreation: boolean;
  onTrackActivity: () => void;
  onSleepSchedule: () => void;
  onViewReports: () => void;
  onFamilySharing: () => void;
  onMemories: () => void;
  onAddProfile: () => void;
  onManageProfiles?: () => void;
  onProfileCreated: (profileData: any) => Promise<boolean>;
  onManageSubscription: () => void;
  onPediatricianReports: () => void;
  onNotifications: () => void;
  onContact: () => void;
  onSetShowProfileCreation: (show: boolean) => void;
  onUpgrade: (feature: string) => void;
}

export const UnifiedDashboard = ({
  user,
  userName,
  isNewUser,
  isPremium,
  profiles,
  stats,
  isDataLoading,
  showProfileCreation,
  onTrackActivity,
  onSleepSchedule,
  onViewReports,
  onFamilySharing,
  onMemories,
  onAddProfile,
  onManageProfiles,
  onProfileCreated,
  onManageSubscription,
  onPediatricianReports,
  onNotifications,
  onContact,
  onSetShowProfileCreation,
  onUpgrade
}: UnifiedDashboardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get enhanced dashboard stats from the dedicated hook
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();

  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  };

  if (showProfileCreation) {
    return (
      <div className="min-h-screen bg-soft gradient-dynamic-slow px-4 py-6">
        <BabyProfileSetup 
          onProfileCreated={onProfileCreated} 
          showBackButton={true} 
          onBack={() => onSetShowProfileCreation(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft gradient-dynamic-slow relative">
      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          Refreshing...
        </div>
      )}

      {/* Main Content with pull-to-refresh */}
      <div 
        className="px-3 tablet:px-6 lg:px-8 pt-4 tablet:pt-6 pb-20 tablet:pb-24 max-w-6xl mx-auto"
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const handleTouchMove = (moveE: TouchEvent) => {
            const currentY = moveE.touches[0].clientY;
            const diff = currentY - startY;
            if (diff > 100 && window.scrollY === 0) {
              handlePullToRefresh();
              document.removeEventListener('touchmove', handleTouchMove);
            }
          };
          document.addEventListener('touchmove', handleTouchMove, { passive: true });
          setTimeout(() => document.removeEventListener('touchmove', handleTouchMove), 500);
        }}
      >
        {/* Welcome Section */}
        <div className="relative">
          <div className="text-center tablet:text-left mb-6 tablet:mb-8">
            <h1 className="text-2xl tablet:text-3xl font-bold text-foreground mb-2 leading-tight">
              {userName ? t('dashboard.welcome', { name: userName }) : t('dashboard.welcomeFallback')}
            </h1>
            <p className="text-muted-foreground text-sm tablet:text-base mb-4">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Profile Section */}
          {!isNewUser ? (
            <div className="mb-6 tablet:mb-8">
              {/* Mobile Profile Selector */}
              <div className="tablet:hidden text-center mb-4">
                <h2 className="text-base font-semibold text-foreground mb-3">Active Profile</h2>
                <div className="flex justify-center">
                  <MobileProfileSelector />
                </div>
              </div>

              {/* Tablet Profile Hub */}
              <div className="hidden tablet:block mb-4">
                <TabletProfileHub onManageProfiles={onManageProfiles} />
              </div>
              
              {!isPremium && profiles.length >= 1 && (
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mt-4 max-w-md mx-auto">
                  <p className="text-xs tablet:text-sm text-warning text-center flex items-center justify-center">
                    <Crown className="h-3 w-3 tablet:h-4 tablet:w-4 mr-2" />
                    Upgrade to Premium for unlimited baby profiles
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Card className="mb-6 tablet:mb-8 border-0 shadow-lg bg-gradient-to-br from-info/5 to-info/15 rounded-2xl max-w-md mx-auto">
              <CardContent className="p-6 tablet:p-8 text-center">
                <div className="bg-gradient-to-br from-info/20 to-info/30 rounded-full w-16 h-16 tablet:w-20 tablet:h-20 flex items-center justify-center mx-auto mb-4 tablet:mb-6 shadow-md">
                  <Baby className="h-8 w-8 tablet:h-10 tablet:w-10 text-info" />
                </div>
                <h3 className="text-lg tablet:text-xl font-bold text-foreground mb-2 tablet:mb-3">
                  {t('dashboard.createProfile')}
                </h3>
                <p className="text-muted-foreground mb-4 tablet:mb-6 text-sm tablet:text-base leading-relaxed">
                  {t('dashboard.noProfileMessage')}
                </p>
                <Button 
                  className="bg-info hover:bg-info/90 text-white px-6 tablet:px-8 py-2 tablet:py-3 rounded-full text-sm tablet:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300" 
                  onClick={onAddProfile}
                >
                  <Plus className="h-4 w-4 tablet:h-5 tablet:w-5 mr-2" />
                  {t('dashboard.addProfile')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upgrade Banner for Basic Users */}
        {!isPremium && (
          <Card className="mb-6 tablet:mb-8 border-0 shadow-md bg-gradient-to-r from-warning/10 to-warning/20 rounded-2xl overflow-hidden max-w-xl mx-auto">
            <CardContent className="p-4 tablet:p-6">
              <div className="flex items-center space-x-3 tablet:space-x-4">
                <div className="bg-gradient-to-br from-warning/30 to-warning/50 rounded-full p-2 tablet:p-3 shadow-md">
                  <Sparkles className="h-5 w-5 tablet:h-6 tablet:w-6 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base tablet:text-lg font-bold text-foreground mb-1">
                    Unlock Premium
                  </h3>
                  <p className="text-muted-foreground text-xs tablet:text-sm leading-relaxed">
                    Unlimited profiles, family sharing & more
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/subscription')} 
                variant="warning" 
                size="sm"
                className="w-full mt-3 tablet:mt-4 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300" 
              >
                <Crown className="h-3 w-3 tablet:h-4 tablet:w-4 mr-2" />
                View Plans
                <ArrowRight className="h-3 w-3 tablet:h-4 tablet:w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Hero Actions - Primary Features */}
        <div className="space-y-3 tablet:space-y-4 mb-6 tablet:mb-8">
          <h3 className="text-lg tablet:text-xl font-bold text-foreground mb-3 tablet:mb-4 text-center tablet:text-left">Quick Actions</h3>
          
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3 tablet:gap-4">
            {/* Track Activities - Hero Card */}
            <Card 
              className="border-0 shadow-md bg-gradient-to-br from-info/10 to-info/20 rounded-2xl cursor-pointer transform transition-all duration-300 active:scale-95 hover:shadow-lg"
              onClick={onTrackActivity}
            >
              <CardContent className="p-4 tablet:p-6">
                <div className="flex items-center space-x-3 tablet:space-x-4">
                  <div className="bg-gradient-to-br from-info/30 to-info/50 rounded-xl p-3 tablet:p-4 shadow-md">
                    <Activity className="h-6 w-6 tablet:h-7 tablet:w-7 text-info" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base tablet:text-lg font-bold text-foreground mb-1">{t('dashboard.trackActivities')}</h3>
                    <p className="text-muted-foreground text-xs tablet:text-sm">{t('dashboard.trackActivitiesDesc')}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 tablet:h-6 tablet:w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Sleep Schedule - Hero Card */}
            <Card 
              className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl cursor-pointer transform transition-all duration-300 active:scale-95 hover:shadow-lg"
              onClick={onSleepSchedule}
            >
              <CardContent className="p-4 tablet:p-6">
                <div className="flex items-center space-x-3 tablet:space-x-4">
                  <div className="bg-gradient-to-br from-primary/30 to-primary/50 rounded-xl p-3 tablet:p-4 shadow-md">
                    <Moon className="h-6 w-6 tablet:h-7 tablet:w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base tablet:text-lg font-bold text-foreground mb-1">{t('dashboard.sleepSchedule')}</h3>
                    <p className="text-muted-foreground text-xs tablet:text-sm">{t('dashboard.sleepScheduleDesc')}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 tablet:h-6 tablet:w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secondary Features Grid */}
        <div className="mb-6 tablet:mb-8">
          <h3 className="text-lg tablet:text-xl font-bold text-foreground mb-3 tablet:mb-4 text-center tablet:text-left">More Features</h3>
          
          <div className="grid grid-cols-2 tablet:grid-cols-3 tablet-lg:grid-cols-4 gap-3 tablet:gap-4">
            {/* Quick Log Card */}
            <div className="col-span-2 tablet:col-span-3 tablet-lg:col-span-4">
              <QuickLogCard />
            </div>

            {/* Reports */}
            <Card 
              className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl cursor-pointer transform transition-all duration-300 active:scale-95"
              onClick={onViewReports}
            >
              <CardContent className="p-3 tablet:p-4 text-center">
                <div className="bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg w-10 h-10 tablet:w-12 tablet:h-12 flex items-center justify-center mx-auto mb-2 tablet:mb-3">
                  <BarChart3 className="h-5 w-5 tablet:h-6 tablet:w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-xs tablet:text-sm">{t('dashboard.viewReports')}</h3>
                <p className="text-2xs tablet:text-xs text-muted-foreground">{t('dashboard.viewReportsDesc')}</p>
              </CardContent>
            </Card>

            {/* Smart Notifications */}
            <Card 
              className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl cursor-pointer transform transition-all duration-300 active:scale-95 relative"
              onClick={onNotifications}
            >
              <CardContent className="p-3 tablet:p-4 text-center">
                <div className="bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-lg w-10 h-10 tablet:w-12 tablet:h-12 flex items-center justify-center mx-auto mb-2 tablet:mb-3">
                  <Bell className="h-5 w-5 tablet:h-6 tablet:w-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-xs tablet:text-sm">Smart Notifications</h3>
                <p className="text-2xs tablet:text-xs text-muted-foreground">Intelligent reminders</p>
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 bg-warning rounded-full p-1">
                    <Crown className="h-2 w-2 tablet:h-3 tablet:w-3 text-white" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Memories */}
            <Card 
              className="border-0 shadow-md bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl cursor-pointer transform transition-all duration-300 active:scale-95 relative"
              onClick={onMemories}
            >
              <CardContent className="p-3 tablet:p-4 text-center">
                <div className="bg-gradient-to-br from-pink-200 to-pink-300 rounded-lg w-10 h-10 tablet:w-12 tablet:h-12 flex items-center justify-center mx-auto mb-2 tablet:mb-3">
                  <Camera className="h-5 w-5 tablet:h-6 tablet:w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-xs tablet:text-sm">Photo & Memories</h3>
                <p className="text-2xs tablet:text-xs text-muted-foreground">Capture moments</p>
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 bg-warning rounded-full p-1">
                    <Crown className="h-2 w-2 tablet:h-3 tablet:w-3 text-white" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Family Sharing */}
            <Card 
              className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 rounded-xl cursor-pointer transform transition-all duration-300 active:scale-95 relative"
              onClick={onFamilySharing}
            >
              <CardContent className="p-3 tablet:p-4 text-center">
                <div className="bg-gradient-to-br from-green-200 to-green-300 rounded-lg w-10 h-10 tablet:w-12 tablet:h-12 flex items-center justify-center mx-auto mb-2 tablet:mb-3">
                  <Users className="h-5 w-5 tablet:h-6 tablet:w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-xs tablet:text-sm">{t('dashboard.familySharing')}</h3>
                <p className="text-2xs tablet:text-xs text-muted-foreground">{t('dashboard.familySharingDesc')}</p>
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 bg-warning rounded-full p-1">
                    <Crown className="h-2 w-2 tablet:h-3 tablet:w-3 text-white" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pediatrician Reports */}
            <Card 
              className="border-0 shadow-md bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl cursor-pointer transform transition-all duration-300 active:scale-95 relative col-span-2 tablet:col-span-1"
              onClick={onPediatricianReports}
            >
              <CardContent className="p-3 tablet:p-4">
                <div className="flex tablet:flex-col tablet:text-center items-center space-x-3 tablet:space-x-0">
                  <div className="bg-gradient-to-br from-teal-200 to-teal-300 rounded-lg w-10 h-10 tablet:w-12 tablet:h-12 flex items-center justify-center flex-shrink-0 tablet:mx-auto tablet:mb-2">
                    <FileText className="h-5 w-5 tablet:h-6 tablet:w-6 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1 text-xs tablet:text-sm">{t('dashboard.pediatricianReports')}</h3>
                    <p className="text-2xs tablet:text-xs text-muted-foreground">{t('dashboard.pediatricianReportsDesc')}</p>
                  </div>
                  {!isPremium && (
                    <div className="bg-warning rounded-full p-1 flex-shrink-0 tablet:absolute tablet:-top-1 tablet:-right-1">
                      <Crown className="h-2 w-2 tablet:h-3 tablet:w-3 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Insights */}
        {!isNewUser && (
          <div className="mb-6 tablet:mb-8">
            <h3 className="text-lg tablet:text-xl font-bold text-foreground mb-3 tablet:mb-4 text-center tablet:text-left">Weekly Insights</h3>
            <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 tablet:gap-4">
              {/* Weekly Average Sleep */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                <CardContent className="p-3 tablet:p-4 text-center">
                  {statsLoading ? (
                    <>
                      <Skeleton className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-full mx-auto mb-2" />
                      <Skeleton className="h-4 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-8 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-lg w-8 h-8 tablet:w-10 tablet:h-10 flex items-center justify-center mx-auto mb-2">
                        <Moon className="h-4 w-4 tablet:h-5 tablet:w-5 text-indigo-600" />
                      </div>
                      <div className="text-sm tablet:text-base font-bold text-indigo-600 mb-1">
                        {dashboardStats?.weeklyAverageSleep || '8h'}
                      </div>
                      <div className="text-2xs tablet:text-xs text-muted-foreground">Avg Sleep</div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* Weekly Feedings */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <CardContent className="p-3 tablet:p-4 text-center">
                  {statsLoading ? (
                    <>
                      <Skeleton className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-full mx-auto mb-2" />
                      <Skeleton className="h-4 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-8 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-green-200 to-green-300 rounded-lg w-8 h-8 tablet:w-10 tablet:h-10 flex items-center justify-center mx-auto mb-2">
                        <Milk className="h-4 w-4 tablet:h-5 tablet:w-5 text-green-600" />
                      </div>
                      <div className="text-sm tablet:text-base font-bold text-green-600 mb-1">
                        {dashboardStats?.weeklyFeedings || '42'}
                      </div>
                      <div className="text-2xs tablet:text-xs text-muted-foreground">Feedings</div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Diaper Changes */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                <CardContent className="p-3 tablet:p-4 text-center">
                  {statsLoading ? (
                    <>
                      <Skeleton className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-full mx-auto mb-2" />
                      <Skeleton className="h-4 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-8 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg w-8 h-8 tablet:w-10 tablet:h-10 flex items-center justify-center mx-auto mb-2">
                        <Baby className="h-4 w-4 tablet:h-5 tablet:w-5 text-amber-600" />
                      </div>
                      <div className="text-sm tablet:text-base font-bold text-amber-600 mb-1">
                        {dashboardStats?.weeklyDiaperChanges || '28'}
                      </div>
                      <div className="text-2xs tablet:text-xs text-muted-foreground">Diapers</div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Growth Trend */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <CardContent className="p-3 tablet:p-4 text-center">
                  {statsLoading ? (
                    <>
                      <Skeleton className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-full mx-auto mb-2" />
                      <Skeleton className="h-4 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-8 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg w-8 h-8 tablet:w-10 tablet:h-10 flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="h-4 w-4 tablet:h-5 tablet:w-5 text-purple-600" />
                      </div>
                      <div className="text-sm tablet:text-base font-bold text-purple-600 mb-1">
                        Steady
                      </div>
                      <div className="text-2xs tablet:text-xs text-muted-foreground">Growth</div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-5 right-4 z-40 tablet:hidden">
          <Button
            onClick={onTrackActivity}
            className="bg-primary hover:bg-primary/90 text-white rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};