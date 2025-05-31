import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  User,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SleepScheduleSetup } from '@/components/sleep-schedule/SleepScheduleSetup';
import { SleepScheduleDisplay } from '@/components/sleep-schedule/SleepScheduleDisplay';
import { SavedSchedules } from '@/components/sleep-schedule/SavedSchedules';
import { ScheduleAdjustmentNotifications } from '@/components/sleep-schedule/ScheduleAdjustmentNotifications';
import { SleepArticles } from '@/components/sleep-schedule/SleepArticles';

const SleepSchedule = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Personalized Sleep Schedule
          </h1>
          <p className="text-gray-600">
            Create and manage sleep schedules tailored to your baby's needs.
          </p>
        </div>

        {/* Sleep Schedule Setup */}
        <div className="mb-8">
          <SleepScheduleSetup />
        </div>

        {/* Sleep Schedule Display */}
        <div className="mb-8">
          <SleepScheduleDisplay />
        </div>

        {/* Saved Schedules */}
        <div className="mb-8">
          <SavedSchedules />
        </div>

        {/* Schedule Adjustment Notifications */}
        <div className="mb-8">
          <ScheduleAdjustmentNotifications />
        </div>

        {/* Sleep Articles & Tips */}
        <div className="mb-8">
          <SleepArticles />
        </div>
      </main>
    </div>
  );
};

export default SleepSchedule;
