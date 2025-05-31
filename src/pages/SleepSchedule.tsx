
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
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { SleepScheduleData, ScheduleRecommendation } from '@/types/sleepSchedule';

const SleepSchedule = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { activeProfile, profiles, loading: profileLoading } = useBabyProfile();
  const { schedules, saveSleepSchedule } = useSleepSchedule(activeProfile?.id || null);
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  
  const [currentRecommendation, setCurrentRecommendation] = useState<ScheduleRecommendation | null>(null);
  const [savedSchedule, setSavedSchedule] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
    // Age-based sleep recommendations
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

    // Generate nap schedule
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
    
    // Save to database
    const saved = await saveSleepSchedule(data, recommendation);
    if (saved) {
      setSavedSchedule(saved);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Moon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading sleep schedule...</p>
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SleepyBaby</span>
            </div>
            <div className="flex items-center space-x-4">
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
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Personalized Sleep Schedule
              </h1>
              <p className="text-gray-600">
                Create and manage sleep schedules tailored to your baby's needs.
              </p>
            </div>
            
            {/* Profile Selector */}
            <div className="flex items-center space-x-4">
              <ProfileSelector 
                onAddProfile={handleAddProfile}
                onManageProfiles={handleManageProfiles}
              />
            </div>
          </div>
        </div>

        {activeProfile ? (
          <>
            {/* Sleep Schedule Setup */}
            {!currentRecommendation && (
              <div className="mb-8">
                <SleepScheduleSetup 
                  onSubmit={handleScheduleSubmit}
                  profile={activeProfile}
                />
              </div>
            )}

            {/* Sleep Schedule Display */}
            {currentRecommendation && (
              <div className="mb-8">
                <SleepScheduleDisplay 
                  recommendation={currentRecommendation}
                  onReset={handleReset}
                  savedSchedule={savedSchedule}
                />
              </div>
            )}

            {/* Saved Schedules */}
            <div className="mb-8">
              <SavedSchedules 
                babyId={activeProfile.id}
                onViewSchedule={handleViewSchedule}
              />
            </div>

            {/* Schedule Adjustment Notifications */}
            {latestSchedule && (
              <div className="mb-8">
                <ScheduleAdjustmentNotifications 
                  babyId={activeProfile.id}
                  currentSchedule={latestSchedule}
                />
              </div>
            )}
          </>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Child Profile Selected</h3>
              <p className="text-gray-600 mb-4">
                Please select or create a child profile to access sleep schedule features.
              </p>
              <Button onClick={handleAddProfile} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Child Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Profile Management Dialog */}
      <ProfileManagementDialog 
        isOpen={showProfileManagement}
        onClose={() => setShowProfileManagement(false)}
      />
    </div>
  );
};

export default SleepSchedule;
