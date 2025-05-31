
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { QuickLogCard } from '@/components/quick-log/QuickLogCard';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { activeProfile, profiles } = useBabyProfile();
  const navigate = useNavigate();
  const [showProfileManagement, setShowProfileManagement] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
    navigate('/family');
  };

  const handleAddProfile = () => {
    setShowProfileManagement(true);
  };

  const handleManageProfiles = () => {
    setShowProfileManagement(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Moon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600 mb-6">
            Ready to track your baby's sleep patterns and activities today?
          </p>
          
          {/* Profile Selector */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Child Profiles</h2>
            <ProfileSelector 
              onAddProfile={handleAddProfile}
              onManageProfiles={handleManageProfiles}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleTrackActivity}>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Activities</h3>
              <p className="text-sm text-gray-600">Log sleep, feeding, diaper changes</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSleepSchedule}>
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Moon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sleep Schedule</h3>
              <p className="text-sm text-gray-600">Get personalized sleep recommendations</p>
            </CardContent>
          </Card>

          <QuickLogCard />

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleFamilySharing}>
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Family Sharing</h3>
              <p className="text-sm text-gray-600">Invite family members and caregivers</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewReports}>
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View Reports</h3>
              <p className="text-sm text-gray-600 mb-3">Analyze sleep and activity patterns</p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Daily Sleep:</span>
                  <span>Track patterns</span>
                </div>
                <div className="flex justify-between">
                  <span>Feeding Data:</span>
                  <span>Monitor frequency</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Trends:</span>
                  <span>Visual charts</span>
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
                <span>Today's Activity Summary</span>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start Tracking Activities</h3>
                  <p className="text-gray-600 mb-4">
                    Begin logging {activeProfile.name}'s activities to see insights and patterns here.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleTrackActivity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Tracking
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create a Child Profile</h3>
                  <p className="text-gray-600 mb-4">
                    Add your first child profile to start tracking activities.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddProfile}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Child Profile
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
                <span>Week Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0h 0m</div>
                <div className="text-sm text-gray-600">Average Sleep</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Feedings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Diaper Changes</div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  {activeProfile 
                    ? `Start tracking ${activeProfile.name}'s activities to see insights`
                    : 'Create a child profile to see personalized insights'
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
    </div>
  );
};

export default Dashboard;
