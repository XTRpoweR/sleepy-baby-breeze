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
  onManageProfiles: () => void;
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
        className="px-4 lg:px-8 pt-6 pb-24 max-w-7xl mx-auto"
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
        {/* Welcome Section with Floating Profile */}
        <div className="relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
              {userName ? t('dashboard.welcome', { name: userName }) : t('dashboard.welcomeFallback')}
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg mb-4">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Profile Section */}
          {!isNewUser ? (
            <div className="mb-8">
              <div className="text-center mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-foreground mb-3">Active Profile</h2>
                <div className="flex justify-center">
                  <MobileProfileSelector />
                </div>
              </div>
              
              {!isPremium && profiles.length >= 1 && (
                <div className="bg-warning/10 border border-warning/20 rounded-2xl p-3 mt-4 max-w-md mx-auto">
                  <p className="text-sm text-warning text-center flex items-center justify-center">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium for unlimited baby profiles
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-info/5 to-info/15 rounded-3xl max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-info/20 to-info/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Baby className="h-12 w-12 text-info" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {t('dashboard.createProfile')}
                </h3>
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  {t('dashboard.noProfileMessage')}
                </p>
                <Button 
                  className="bg-info hover:bg-info/90 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={onAddProfile}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('dashboard.addProfile')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upgrade Banner for Basic Users */}
        {!isPremium && (
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-warning/10 to-warning/20 rounded-3xl overflow-hidden max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-warning/30 to-warning/50 rounded-full p-3 shadow-lg">
                  <Sparkles className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Unlock Premium
                  </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Unlimited profiles, family sharing & more for $29.99/month
                    </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/subscription')} 
                variant="warning" 
                className="w-full mt-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
              >
                <Crown className="h-4 w-4 mr-2" />
                View Premium Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Hero Actions - Primary Features */}
        <div className="space-y-4 mb-8 max-w-4xl mx-auto">
          <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4 text-center lg:text-left">Quick Actions</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Track Activities - Hero Card */}
            <Card 
              className="border-0 shadow-xl bg-gradient-to-br from-info/10 to-info/20 rounded-3xl cursor-pointer transform transition-all duration-500 active:scale-95 hover:shadow-2xl hover:shadow-info/25 hover:scale-105 hover:-translate-y-2 group"
              onClick={onTrackActivity}
            >
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-info/30 to-info/50 rounded-2xl p-4 shadow-lg transition-all duration-500 group-hover:shadow-info/40 group-hover:scale-110">
                    <Activity className="h-8 w-8 text-info transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{t('dashboard.trackActivities')}</h3>
                    <p className="text-muted-foreground text-base">{t('dashboard.trackActivitiesDesc')}</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Sleep Schedule - Hero Card */}
            <Card 
              className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl cursor-pointer transform transition-all duration-500 active:scale-95 hover:shadow-2xl hover:shadow-primary/25 hover:scale-105 hover:-translate-y-2 group"
              onClick={onSleepSchedule}
            >
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-primary/30 to-primary/50 rounded-2xl p-4 shadow-lg transition-all duration-500 group-hover:shadow-primary/40 group-hover:scale-110">
                    <Moon className="h-8 w-8 text-primary transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{t('dashboard.sleepSchedule')}</h3>
                    <p className="text-muted-foreground text-base">{t('dashboard.sleepScheduleDesc')}</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secondary Features Grid */}
        <div className="mb-8 max-w-6xl mx-auto">
          <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4 text-center lg:text-left">More Features</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Quick Log Card */}
            <div className="col-span-2 lg:col-span-3 xl:col-span-4">
              <QuickLogCard />
            </div>

            {/* Reports */}
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl cursor-pointer transform transition-all duration-500 active:scale-95 hover:shadow-xl hover:shadow-orange-200/50 hover:scale-105 hover:-translate-y-1 group"
              onClick={onViewReports}
            >
              <CardContent className="p-4 lg:p-6 text-center">
                <div className="bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 transition-all duration-500 group-hover:shadow-orange-300/50 group-hover:scale-110">
                  <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 transition-transform duration-500 group-hover:rotate-6" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-sm lg:text-base">{t('dashboard.viewReports')}</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">{t('dashboard.viewReportsDesc')}</p>
              </CardContent>
            </Card>

            {/* Smart Notifications */}
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl cursor-pointer transform transition-all duration-500 active:scale-95 hover:shadow-xl hover:shadow-indigo-200/50 hover:scale-105 hover:-translate-y-1 group relative"
              onClick={onNotifications}
            >
              <CardContent className="p-4 lg:p-6 text-center">
                <div className="bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 transition-all duration-500 group-hover:shadow-indigo-300/50 group-hover:scale-110">
                  <Bell className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600 transition-transform duration-500 group-hover:animate-bounce" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-sm lg:text-base">Smart Notifications</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">Intelligent reminders</p>
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 bg-warning rounded-full p-1">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Memories */}
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl cursor-pointer transform transition-all duration-500 active:scale-95 hover:shadow-xl hover:shadow-pink-200/50 hover:scale-105 hover:-translate-y-1 group relative"
              onClick={onMemories}
            >
              <CardContent className="p-4 lg:p-6 text-center">
                <div className="bg-gradient-to-br from-pink-200 to-pink-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 transition-all duration-500 group-hover:shadow-pink-300/50 group-hover:scale-110">
                  <Camera className="h-6 w-6 lg:h-8 lg:w-8 text-pink-600 transition-transform duration-500 group-hover:rotate-12" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-sm lg:text-base">Photo & Memories</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">Capture moments</p>
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 bg-warning rounded-full p-1">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Family Sharing */}
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 rounded-2xl cursor-pointer transform transition-all duration-500 active:scale-95 hover:shadow-xl hover:shadow-green-200/50 hover:scale-105 hover:-translate-y-1 group relative"
              onClick={onFamilySharing}
            >
              <CardContent className="p-4 lg:p-6 text-center">
                <div className="bg-gradient-to-br from-green-200 to-green-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 transition-all duration-500 group-hover:shadow-green-300/50 group-hover:scale-110">
                  <Users className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-sm lg:text-base">{t('dashboard.familySharing')}</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">{t('dashboard.familySharingDesc')}</p>
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 bg-warning rounded-full p-1">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pediatrician Reports */}
            <Card 
              className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl cursor-pointer transform transition-all duration-500 active:scale-95 hover:shadow-xl hover:shadow-teal-200/50 hover:scale-105 hover:-translate-y-1 group relative col-span-2 lg:col-span-1"
              onClick={onPediatricianReports}
            >
              <CardContent className="p-4 lg:p-6">
                <div className="flex lg:flex-col lg:text-center items-center space-x-3 lg:space-x-0">
                  <div className="bg-gradient-to-br from-teal-200 to-teal-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center flex-shrink-0 lg:mx-auto lg:mb-3 transition-all duration-500 group-hover:shadow-teal-300/50 group-hover:scale-110">
                    <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-teal-600 transition-transform duration-500 group-hover:rotate-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1 text-sm lg:text-base">{t('dashboard.pediatricianReports')}</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">{t('dashboard.pediatricianReportsDesc')}</p>
                  </div>
                  {!isPremium && (
                    <div className="bg-warning rounded-full p-1 flex-shrink-0 lg:absolute lg:-top-1 lg:-right-1">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Baby Insights */}
        {!isNewUser && (
          <div className="mb-8 max-w-4xl mx-auto">
            <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4 text-center lg:text-left">Weekly Insights</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Weekly Average Sleep */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl transform transition-all duration-500 hover:shadow-xl hover:shadow-indigo-200/50 hover:scale-105 hover:-translate-y-1 group">
                <CardContent className="p-4 lg:p-6 text-center">
                  {statsLoading ? (
                    <>
                      <Skeleton className="w-8 h-8 lg:w-12 lg:h-12 rounded-full mx-auto mb-3" />
                      <Skeleton className="h-6 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3">
                        <Moon className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600" />
                      </div>
                      <div className="text-lg lg:text-xl font-bold text-indigo-600 mb-1">
                        {dashboardStats.weeklyAverageSleep}
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">Avg Sleep</div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* Weekly Feedings */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 rounded-2xl transform transition-all duration-500 hover:shadow-xl hover:shadow-green-200/50 hover:scale-105 hover:-translate-y-1 group">
                <CardContent className="p-4 lg:p-6 text-center">
                  {statsLoading ? (
                    <>
                      <Skeleton className="w-8 h-8 lg:w-12 lg:h-12 rounded-full mx-auto mb-3" />
                      <Skeleton className="h-6 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-green-200 to-green-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 transition-all duration-500 group-hover:shadow-green-300/50 group-hover:scale-110">
                        <Milk className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 transition-transform duration-500 group-hover:rotate-12" />
                      </div>
                      <div className="text-lg lg:text-xl font-bold text-green-600 mb-1">
                        {dashboardStats.weeklyFeedings}
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">Feedings</div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Diaper Changes */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl transform transition-all duration-500 hover:shadow-xl hover:shadow-amber-200/50 hover:scale-105 hover:-translate-y-1 group">
                <CardContent className="p-4 lg:p-6 text-center">
                  {statsLoading ? (
                    <>
                      <Skeleton className="w-8 h-8 lg:w-12 lg:h-12 rounded-full mx-auto mb-3" />
                      <Skeleton className="h-6 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 transition-all duration-500 group-hover:shadow-amber-300/50 group-hover:scale-110">
                        <Baby className="h-6 w-6 lg:h-8 lg:w-8 text-amber-600 transition-transform duration-500 group-hover:bounce" />
                      </div>
                      <div className="text-lg lg:text-xl font-bold text-amber-600 mb-1">
                        {dashboardStats.weeklyDiaperChanges}
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">Diapers</div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Growth Trend */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl transform transition-all duration-500 hover:shadow-xl hover:shadow-purple-200/50 hover:scale-105 hover:-translate-y-1 group">
                <CardContent className="p-4 lg:p-6 text-center">
                  {statsLoading ? (
                    <>
                      <Skeleton className="w-8 h-8 lg:w-12 lg:h-12 rounded-full mx-auto mb-3" />
                      <Skeleton className="h-6 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 transition-all duration-500 group-hover:shadow-purple-300/50 group-hover:scale-110">
                        <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                      </div>
                      <div className="text-lg lg:text-xl font-bold text-purple-600 mb-1">
                        Steady
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">Growth</div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <Button
            onClick={onTrackActivity}
            className="bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 p-0 shadow-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 active:scale-95"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};