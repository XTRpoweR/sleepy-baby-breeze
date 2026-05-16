import { memo, useEffect, useState } from 'react';
import { prefetchDashboardRoutes, prefetchRoute } from '@/utils/prefetchRoutes';
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
import { NewsletterManagerDialog } from '@/components/NewsletterManagerDialog';
import { Mail } from 'lucide-react';

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
  activeProfile: any;
  switching: any;
  switchProfile: (profileId: string) => Promise<boolean>;
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
  onUpgrade,
  activeProfile,
  switching,
  switchProfile
}: UnifiedDashboardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  // Prefetch the most-used routes in the background once the dashboard mounts
  useEffect(() => {
    prefetchDashboardRoutes();
  }, []);

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
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50 overflow-x-hidden">
      {/* Decorative gradient blobs — fixed so they don't repaint on scroll */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-pink-300/40 blur-2xl" />
        <div className="absolute top-40 right-0 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-purple-300/40 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-indigo-300/30 blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_50%)]" />
      </div>

      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          Refreshing...
        </div>
      )}

      {/* Main Content with pull-to-refresh */}
      <div
        className="relative px-4 lg:px-8 pt-6 pb-24 max-w-7xl mx-auto"
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
              {userName ? (() => {
                const full = t('dashboard.welcome', { name: userName });
                const [before, after = ''] = full.split(userName);
                return (
                  <>
                    {before}
                    <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                      {userName}
                    </span>
                    {after}
                  </>
                );
              })() : t('dashboard.welcomeFallback')}
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg mb-4">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Profile Section */}
          {!isNewUser ? (
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <MobileProfileSelector
                  key={activeProfile?.id || 'no-profile'}
                  activeProfile={activeProfile}
                  switching={switching}
                  profiles={profiles}
                  switchProfile={switchProfile}
                />
              </div>
              
              {!isPremium && profiles.length >= 1 && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-purple-200/60 rounded-2xl p-3 mt-4 max-w-md mx-auto">
                  <p className="text-sm text-purple-700 text-center flex items-center justify-center gap-2 font-medium">
                    <Crown className="h-4 w-4 text-purple-500" />
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

        {/* Upgrade Banner — Liquid Glass Light (with gradient ring glow) */}
        {!isPremium && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative group">
              {/* Outer gradient glow */}
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-60 blur" />
              <div className="relative bg-white/90 border border-white/90 rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-2.5 shadow-lg shadow-purple-500/30 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">Get Premium</h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded">
                        7 days free
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-sm text-gray-600 truncate leading-snug">
                      Unlimited profiles · family sharing · pediatrician reports
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate('/subscription')}
                    className="flex-shrink-0 rounded-full font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-md shadow-purple-500/30 px-3 sm:px-4 h-9"
                  >
                    <span className="hidden sm:inline">Try free</span>
                    <span className="sm:hidden">Try</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Actions - Primary Features */}
        <div className="space-y-4 mb-8 max-w-4xl mx-auto">
          <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4 text-center lg:text-left">Quick Actions</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Track Activities - Polished Glass */}
            <button
              onClick={onTrackActivity}
              onPointerEnter={() => prefetchRoute('track')}
              onTouchStart={() => prefetchRoute('track')}
              className="relative text-left bg-white/85 border border-white/90 rounded-3xl p-6 lg:p-7 transition-transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] group"
              style={{
                boxShadow:
                  '0 10px 30px -10px rgba(236, 72, 153, 0.18), 0 4px 12px -4px rgba(168, 85, 247, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent rounded-t-3xl" />
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-3.5 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t('dashboard.trackActivities')}</h3>
                  <p className="text-gray-600 text-sm">{t('dashboard.trackActivitiesDesc')}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Sleep Schedule - Polished Glass */}
            <button
              onClick={onSleepSchedule}
              onPointerEnter={() => prefetchRoute('sleep')}
              onTouchStart={() => prefetchRoute('sleep')}
              className="relative text-left bg-white/85 border border-white/90 rounded-3xl p-6 lg:p-7 transition-transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] group"
              style={{
                boxShadow:
                  '0 10px 30px -10px rgba(99, 102, 241, 0.18), 0 4px 12px -4px rgba(168, 85, 247, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent rounded-t-3xl" />
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-3.5 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <Moon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t('dashboard.sleepSchedule')}</h3>
                  <p className="text-gray-600 text-sm">{t('dashboard.sleepScheduleDesc')}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>
        </div>

        {/* Newsletter pill — small, attractive, non-intrusive */}
        <div className="max-w-4xl mx-auto mb-8 flex justify-center">
          <button
            onClick={() => setNewsletterOpen(true)}
            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white px-5 py-2.5 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 hover:scale-105 active:scale-95 transition-all duration-300 touch-manipulation"
          >
            <span className="bg-white/20 rounded-full p-1.5 group-hover:rotate-12 transition-transform duration-300">
              <Mail className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">Get sleep tips by email</span>
          </button>
        </div>

        {/* Secondary Features Grid */}
        <div className="mb-8 max-w-6xl mx-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
          <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4 text-center lg:text-left">More Features</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Quick Log Card */}
            <div className="col-span-2 lg:col-span-3 xl:col-span-4">
              <QuickLogCard />
            </div>

            <FeatureGlassCard
              onClick={onViewReports}
              icon={<BarChart3 className="h-6 w-6 lg:h-7 lg:w-7 text-white" />}
              title={t('dashboard.viewReports')}
              subtitle={t('dashboard.viewReportsDesc')}
              gradient="from-rose-500 to-pink-500"
              shadowColor="rgba(236, 72, 153, 0.18)"
              isPremium={false}
            />
            <FeatureGlassCard
              onClick={onNotifications}
              icon={<Bell className="h-6 w-6 lg:h-7 lg:w-7 text-white" />}
              title="Smart Notifications"
              subtitle="Intelligent reminders"
              gradient="from-indigo-500 to-blue-500"
              shadowColor="rgba(99, 102, 241, 0.18)"
              isPremium={!isPremium}
            />
            <FeatureGlassCard
              onClick={onMemories}
              icon={<Camera className="h-6 w-6 lg:h-7 lg:w-7 text-white" />}
              title="Photo & Memories"
              subtitle="Capture moments"
              gradient="from-pink-500 to-fuchsia-500"
              shadowColor="rgba(236, 72, 153, 0.18)"
              isPremium={!isPremium}
            />
            <FeatureGlassCard
              onClick={onFamilySharing}
              icon={<Users className="h-6 w-6 lg:h-7 lg:w-7 text-white" />}
              title={t('dashboard.familySharing')}
              subtitle={t('dashboard.familySharingDesc')}
              gradient="from-emerald-500 to-teal-500"
              shadowColor="rgba(16, 185, 129, 0.18)"
              isPremium={!isPremium}
            />
            <FeatureGlassCard
              onClick={onPediatricianReports}
              icon={<FileText className="h-6 w-6 lg:h-7 lg:w-7 text-white" />}
              title={t('dashboard.pediatricianReports')}
              subtitle={t('dashboard.pediatricianReportsDesc')}
              gradient="from-purple-500 to-violet-500"
              shadowColor="rgba(168, 85, 247, 0.18)"
              isPremium={!isPremium}
              wideOnMobile
            />
          </div>
        </div>

        {/* Enhanced Baby Insights */}
        {!isNewUser && (
          <div className="mb-8 max-w-4xl mx-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}>
            <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4 text-center lg:text-left">Weekly Insights</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatGlassCard isLoading={isDataLoading} icon={<Moon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />} value={stats.weeklyAverageSleep} label="Avg Sleep" gradient="from-indigo-500 to-purple-500" />
              <StatGlassCard isLoading={isDataLoading} icon={<Milk className="h-5 w-5 lg:h-6 lg:w-6 text-white" />} value={stats.weeklyFeedings} label="Feedings" gradient="from-emerald-500 to-teal-500" />
              <StatGlassCard isLoading={isDataLoading} icon={<Baby className="h-5 w-5 lg:h-6 lg:w-6 text-white" />} value={stats.weeklyDiaperChanges} label="Diapers" gradient="from-amber-500 to-orange-500" />
              <StatGlassCard isLoading={isDataLoading} icon={<TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />} value="Steady" label="Growth" gradient="from-purple-500 to-fuchsia-500" />
            </div>
          </div>
        )}

      </div>
      <NewsletterManagerDialog open={newsletterOpen} onOpenChange={setNewsletterOpen} />
    </div>
  );
};

/**
 * Liquid Glass Light feature card.
 * Translucent white background, gradient icon, premium sparkle badge.
 */
const FeatureGlassCard = memo(function FeatureGlassCard({
  onClick,
  icon,
  title,
  subtitle,
  gradient,
  shadowColor,
  isPremium,
  wideOnMobile,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  shadowColor: string;
  isPremium: boolean;
  wideOnMobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left bg-white/85 border border-white/90 rounded-3xl p-4 lg:p-6 transition-transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] group ${wideOnMobile ? 'col-span-2 lg:col-span-1' : ''}`}
      style={{
        boxShadow: `0 10px 30px -10px ${shadowColor}, 0 4px 12px -4px rgba(168, 85, 247, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)`,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent rounded-t-3xl" />
      {isPremium && (
        <span className="absolute top-3 right-3 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-md ring-2 ring-white">
          <Sparkles className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        </span>
      )}
      <div className="text-center">
        <div
          className={`bg-gradient-to-br ${gradient} rounded-2xl w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 mb-1 text-sm lg:text-base">{title}</h3>
        <p className="text-xs text-gray-600 leading-snug">{subtitle}</p>
      </div>
    </button>
  );
});

const StatGlassCard = memo(function StatGlassCard({
  isLoading,
  icon,
  value,
  label,
  gradient,
}: {
  isLoading: boolean;
  icon: React.ReactNode;
  value: string | number;
  label: string;
  gradient: string;
}) {
  return (
    <div
      className="relative bg-white/85 border border-white/90 rounded-3xl p-4 lg:p-5 text-center"
      style={{
        boxShadow: '0 8px 24px -8px rgba(168, 85, 247, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent rounded-t-3xl" />
      {isLoading ? (
        <>
          <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl mx-auto mb-3" />
          <Skeleton className="h-5 w-16 mx-auto mb-1" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </>
      ) : (
        <>
          <div className={`bg-gradient-to-br ${gradient} rounded-2xl w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-3 shadow-md`}>
            {icon}
          </div>
          <div className="text-lg lg:text-xl font-bold text-gray-900 mb-0.5">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </>
      )}
    </div>
  );
});