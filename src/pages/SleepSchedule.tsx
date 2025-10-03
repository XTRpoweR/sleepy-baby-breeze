
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Moon, 
  User,
  LogOut,
  ArrowLeft,
  Baby,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSleepSchedule } from '@/hooks/useSleepSchedule';
import { SleepScheduleSetup } from '@/components/sleep-schedule/SleepScheduleSetup';
import { SleepScheduleDisplay } from '@/components/sleep-schedule/SleepScheduleDisplay';
import { SavedSchedules } from '@/components/sleep-schedule/SavedSchedules';
import { ScheduleAdjustmentNotifications } from '@/components/sleep-schedule/ScheduleAdjustmentNotifications';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { MobileProfileSelector } from '@/components/profiles/MobileProfileSelector';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { PermissionAwareActions } from '@/components/tracking/PermissionAwareActions';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { SleepScheduleData, ScheduleRecommendation } from '@/types/sleepSchedule';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const SleepSchedule = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { activeProfile, profiles, loading: profileLoading } = useBabyProfile();
  const { schedules, loading: schedulesLoading, saveSleepSchedule, deleteSleepSchedule, refetch } = useSleepSchedule(activeProfile?.id || null);
  const { role } = useProfilePermissions(activeProfile?.id || null);
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  
  const [currentRecommendation, setCurrentRecommendation] = useState<ScheduleRecommendation | null>(null);
  const [savedSchedule, setSavedSchedule] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleAddProfile = () => {
    setShowProfileManagement(true);
  };

  const handleManageProfiles = () => {
    setShowProfileManagement(true);
  };

  const generateScheduleRecommendation = (data: SleepScheduleData): ScheduleRecommendation => {
    let totalSleepHours: number;
    let napCount: number;
    let napDuration: number;
    let bedtimeAdjustment = 0;
    
    if (data.childAge <= 3) {
      totalSleepHours = 16;
      napCount = 4;
      napDuration = 120;
    } else if (data.childAge <= 6) {
      totalSleepHours = 14;
      napCount = 3;
      napDuration = 90;
    } else if (data.childAge <= 12) {
      totalSleepHours = 13;
      napCount = 2;
      napDuration = 75;
    } else if (data.childAge <= 18) {
      totalSleepHours = 12.5;
      napCount = 1;
      napDuration = 90;
    } else {
      totalSleepHours = 12;
      napCount = 1;
      napDuration = 60;
    }

    const naps = [];
    const wakeHour = parseInt(data.currentWakeTime.split(':')[0]);
    
    for (let i = 0; i < napCount; i++) {
      const napTime = wakeHour + 2 + (i * 3);
      const napName = napCount === 1 ? 'Afternoon Nap' : 
                     i === 0 ? 'Morning Nap' :
                     i === 1 ? 'Afternoon Nap' :
                     i === 2 ? 'Late Afternoon Nap' : 'Evening Nap';
      
      if (napTime < 18) { // Don't schedule naps too late
        naps.push({
          name: napName,
          startTime: `${napTime.toString().padStart(2, '0')}:00`,
          duration: napDuration
        });
      }
    }

    return {
      bedtime: data.currentBedtime,
      wakeTime: data.currentWakeTime,
      naps: naps.slice(0, napCount),
      totalSleepHours
    };
  };

  const handleScheduleSubmit = async (data: SleepScheduleData) => {
    const recommendation = generateScheduleRecommendation(data);
    setCurrentRecommendation(recommendation);
    
    const saved = await saveSleepSchedule(data, recommendation);
    if (saved) {
      setSavedSchedule(saved);
      refetch();
    }
  };

  const handleScheduleDeleted = () => {
    refetch();
  };

  const handleReset = () => {
    setCurrentRecommendation(null);
    setSavedSchedule(null);
  };

  const handleViewSchedule = (schedule: any) => {
    const recommendation: ScheduleRecommendation = {
      bedtime: schedule.recommended_bedtime,
      wakeTime: schedule.recommended_wake_time,
      naps: Array.isArray(schedule.recommended_naps) ? schedule.recommended_naps : [],
      totalSleepHours: schedule.total_sleep_hours
    };
    setCurrentRecommendation(recommendation);
    setSavedSchedule(schedule);
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Moon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-sm sm:text-base">
            {t('pages.sleepSchedule.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const latestSchedule = schedules.length > 0 ? schedules[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DesktopHeader />
      <MobileHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{t('navigation.backToDashboard')}</span>
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t('pages.sleepSchedule.title')}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {t('pages.sleepSchedule.subtitle')}
              </p>
            </div>
            
            {/* Active Profile Selector */}
            <div className="flex items-center">
              <div className="hidden lg:block">
                <ProfileSelector />
              </div>
              
              <div className="lg:hidden w-full">
                <MobileProfileSelector />
              </div>
            </div>
          </div>
        </div>

        {activeProfile ? (
          <div className="space-y-6 lg:space-y-8">
            {role === 'viewer' && (
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  You have view-only access to sleep schedules. You can view existing schedules and recommendations, but cannot create or modify sleep schedules. Contact the baby's owner for caregiver access to manage sleep schedules.
                </AlertDescription>
              </Alert>
            )}

            <PermissionAwareActions requiredPermission="canEdit" showMessage={false}>
              {!currentRecommendation && (
                <div>
                  <SleepScheduleSetup 
                    onSubmit={handleScheduleSubmit}
                    profile={activeProfile}
                  />
                </div>
              )}
            </PermissionAwareActions>

            {currentRecommendation && (
              <div>
                <SleepScheduleDisplay 
                  recommendation={currentRecommendation}
                  onReset={handleReset}
                  savedSchedule={savedSchedule}
                />
              </div>
            )}

            <div>
              <SavedSchedules 
                babyId={activeProfile.id}
                schedules={schedules}
                loading={schedulesLoading}
                deleteSleepSchedule={deleteSleepSchedule}
                onViewSchedule={handleViewSchedule}
                onScheduleDeleted={handleScheduleDeleted}
              />
            </div>

            <PermissionAwareActions requiredPermission="canEdit" showMessage={false}>
              {latestSchedule && (
                <div>
                  <ScheduleAdjustmentNotifications 
                    babyId={activeProfile.id}
                    currentSchedule={latestSchedule}
                  />
                </div>
              )}
            </PermissionAwareActions>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 sm:p-8 text-center">
              <Baby className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{t('pages.sleepSchedule.noProfile')}</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {t('pages.sleepSchedule.noProfileMessage')}
              </p>
              <PermissionAwareActions requiredPermission="canEdit" showMessage={false}>
                <Button onClick={handleAddProfile} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pages.sleepSchedule.addProfile')}
                </Button>
              </PermissionAwareActions>
            </CardContent>
          </Card>
        )}
      </main>

      <ProfileManagementDialog 
        open={showProfileManagement}
        onOpenChange={setShowProfileManagement}
      />
    </div>
  );
};

export default SleepSchedule;
