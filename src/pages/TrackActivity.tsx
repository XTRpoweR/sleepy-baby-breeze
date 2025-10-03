
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  Baby, 
  Milk as Bottle,
  Plus,
  ArrowLeft,
  Clock,
  History,
  Settings,
  Shield
} from 'lucide-react';
import { SleepTracker } from '@/components/tracking/SleepTracker';
import { FeedingTracker } from '@/components/tracking/FeedingTracker';
import { DiaperTracker } from '@/components/tracking/DiaperTracker';
import { CustomActivityTracker } from '@/components/tracking/CustomActivityTracker';
import { ActivityLogsList } from '@/components/tracking/ActivityLogsList';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { MobileProfileSelector } from '@/components/profiles/MobileProfileSelector';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { PermissionAwareActions } from '@/components/tracking/PermissionAwareActions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { useIsMobile } from '@/hooks/use-mobile';
import { TranslationWrapper } from '@/components/TranslationWrapper';

const TrackActivity = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { activeProfile, profiles, loading: profileLoading, switching, createProfile } = useBabyProfile();
  const { logs, loading: logsLoading, deleteLog, updateLog, refetchLogs } = useActivityLogs(activeProfile?.id || '');
  const { permissions, role, loading: permissionsLoading } = useProfilePermissions(activeProfile?.id || null);
  const [activeTab, setActiveTab] = useState('sleep');
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Debug logging for profile changes
  useEffect(() => {
    console.log('TrackActivity: activeProfile changed to:', activeProfile?.id, activeProfile?.name);
  }, [activeProfile]);

  const handleAddProfile = () => {
    setShowProfileManagement(true);
  };

  const handleManageProfiles = () => {
    setShowProfileManagement(true);
  };

  const handleActivityAdded = () => {
    console.log('Activity added, refreshing logs...');
    refetchLogs();
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Baby className="h-12 w-12 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground text-sm animate-fade-in">{t('pages.trackActivity.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (profiles.length === 0) {
    return (
      <TranslationWrapper>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-4 sm:mb-6 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('navigation.backToDashboard')}
            </Button>
            <BabyProfileSetup onProfileCreated={createProfile} />
          </div>
        </div>
      </TranslationWrapper>
    );
  }

  return (
    <TranslationWrapper>
      <div className="min-h-screen bg-soft gradient-dynamic-slow">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <div className="mb-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                  size={isMobile ? "sm" : "default"}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('navigation.back')}
                </Button>
              </div>
              
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gradient">{t('pages.trackActivity.title')}</h1>
                {activeProfile && (
                  <p className="text-muted-foreground text-sm sm:text-base">{t('pages.trackActivity.subtitle', { name: activeProfile.name })}</p>
                )}
              </div>
            </div>
            
            {/* Language Selector */}
            {!isMobile && (
              <div className="flex items-center">
                <LanguageSelector />
              </div>
            )}
          </div>

          {/* Role-based messaging for viewers */}
          {role === 'viewer' && (
            <Alert className="mb-6 border-primary/20 bg-primary/5">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                You have view-only access to {activeProfile?.name}'s activities. You can see all activity logs and statistics, but cannot add, edit, or delete activities. Contact the baby's owner for caregiver access if you need to track activities.
              </AlertDescription>
            </Alert>
          )}

          {activeProfile ? (
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Activity Tracking */}
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 sm:gap-3 p-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-[20px] shadow-sm mb-6 sm:mb-8 items-center`}>
                    <TabsTrigger 
                      value="sleep" 
                      className="group flex items-center justify-center gap-2 text-xs sm:text-sm px-4 py-3 sm:py-3.5 text-muted-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-[16px] hover:bg-accent/50 hover:text-foreground"
                    >
                      <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px] opacity-60 group-data-[state=active]:opacity-100 transition-opacity" />
                      <span className="hidden xs:inline font-medium">{t('activities.sleep')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="feeding" 
                      className="group flex items-center justify-center gap-2 text-xs sm:text-sm px-4 py-3 sm:py-3.5 text-muted-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-[16px] hover:bg-accent/50 hover:text-foreground"
                    >
                      <Bottle className="h-4 w-4 sm:h-[18px] sm:w-[18px] opacity-60 group-data-[state=active]:opacity-100 transition-opacity" />
                      <span className="hidden xs:inline font-medium">{t('activities.feeding')}</span>
                    </TabsTrigger>
                    {!isMobile && (
                      <>
                        <TabsTrigger 
                          value="diaper" 
                          className="group flex items-center justify-center gap-2 text-xs sm:text-sm px-4 py-3.5 text-muted-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-[16px] hover:bg-accent/50 hover:text-foreground"
                        >
                          <Baby className="h-[18px] w-[18px] opacity-60 group-data-[state=active]:opacity-100 transition-opacity" />
                          <span className="font-medium">{t('activities.diaper')}</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="custom" 
                          className="group flex items-center justify-center gap-2 text-xs sm:text-sm px-4 py-3.5 text-muted-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-[16px] hover:bg-accent/50 hover:text-foreground"
                        >
                          <Plus className="h-[18px] w-[18px] opacity-60 group-data-[state=active]:opacity-100 transition-opacity" />
                          <span className="font-medium">{t('activities.custom')}</span>
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  {/* Mobile: Second row of tabs */}
                  {isMobile && (
                    <TabsList className="grid w-full grid-cols-2 gap-2 p-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-[20px] shadow-sm mb-6 items-center">
                      <TabsTrigger 
                        value="diaper" 
                        className="group flex items-center justify-center gap-2 text-xs px-4 py-3 text-muted-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-[16px] hover:bg-accent/50 hover:text-foreground"
                      >
                        <Baby className="h-4 w-4 opacity-60 group-data-[state=active]:opacity-100 transition-opacity" />
                        <span className="font-medium">{t('activities.diaper')}</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="custom" 
                        className="group flex items-center justify-center gap-2 text-xs px-4 py-3 text-muted-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-[16px] hover:bg-accent/50 hover:text-foreground"
                      >
                        <Plus className="h-4 w-4 opacity-60 group-data-[state=active]:opacity-100 transition-opacity" />
                        <span className="font-medium">{t('activities.custom')}</span>
                      </TabsTrigger>
                    </TabsList>
                  )}

                  <TabsContent value="sleep">
                    <PermissionAwareActions requiredPermission="canEdit">
                      <SleepTracker babyId={activeProfile.id} onActivityAdded={handleActivityAdded} />
                    </PermissionAwareActions>
                  </TabsContent>

                  <TabsContent value="feeding">
                    <PermissionAwareActions requiredPermission="canEdit">
                      <FeedingTracker babyId={activeProfile.id} onActivityAdded={handleActivityAdded} />
                    </PermissionAwareActions>
                  </TabsContent>

                  <TabsContent value="diaper">
                    <PermissionAwareActions requiredPermission="canEdit">
                      <DiaperTracker babyId={activeProfile.id} onActivityAdded={handleActivityAdded} />
                    </PermissionAwareActions>
                  </TabsContent>

                  <TabsContent value="custom">
                    <PermissionAwareActions requiredPermission="canEdit">
                      <CustomActivityTracker babyId={activeProfile.id} onActivityAdded={handleActivityAdded} />
                    </PermissionAwareActions>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Activity Logs */}
              <div className="lg:col-span-1">
                <ActivityLogsList 
                  babyId={activeProfile.id}
                  logs={logs}
                  loading={logsLoading || switching}
                  deleteLog={deleteLog}
                  updateLog={updateLog}
                  onActivityUpdated={handleActivityAdded}
                />
              </div>
            </div>
          ) : (
            <Card className="max-w-md mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <Baby className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 animate-fade-in" />
                <h3 className="text-lg font-medium text-foreground mb-2">{t('pages.trackActivity.noActiveProfile')}</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {t('pages.trackActivity.selectProfileMessage')}
                </p>
                <Button 
                  onClick={handleAddProfile} 
                  variant="gradient"
                  className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dashboard.addProfile')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Profile Management Dialog */}
        <ProfileManagementDialog 
          open={showProfileManagement}
          onOpenChange={setShowProfileManagement}
        />
      </div>
    </TranslationWrapper>
  );
};

export default TrackActivity;
