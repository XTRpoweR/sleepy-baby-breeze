
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  Baby, 
  DropletIcon as Bottle,
  Heart,
  Plus,
  ArrowLeft,
  Clock,
  History
} from 'lucide-react';
import { SleepTracker } from '@/components/tracking/SleepTracker';
import { FeedingTracker } from '@/components/tracking/FeedingTracker';
import { DiaperTracker } from '@/components/tracking/DiaperTracker';
import { CustomActivityTracker } from '@/components/tracking/CustomActivityTracker';
import { ActivityLogsList } from '@/components/tracking/ActivityLogsList';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { useBabyProfile } from '@/hooks/useBabyProfile';

const TrackActivity = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, createProfile } = useBabyProfile();
  const [activeTab, setActiveTab] = useState('sleep');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Baby className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <BabyProfileSetup onProfileCreated={createProfile} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Activities</h1>
              <p className="text-gray-600">Recording for {profile.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <Baby className="h-6 w-6" />
            <span className="font-medium">{profile.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Tracking */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="sleep" className="flex items-center space-x-2">
                  <Moon className="h-4 w-4" />
                  <span>Sleep</span>
                </TabsTrigger>
                <TabsTrigger value="feeding" className="flex items-center space-x-2">
                  <Bottle className="h-4 w-4" />
                  <span>Feeding</span>
                </TabsTrigger>
                <TabsTrigger value="diaper" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Diaper</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Custom</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sleep">
                <SleepTracker babyId={profile.id} />
              </TabsContent>

              <TabsContent value="feeding">
                <FeedingTracker babyId={profile.id} />
              </TabsContent>

              <TabsContent value="diaper">
                <DiaperTracker babyId={profile.id} />
              </TabsContent>

              <TabsContent value="custom">
                <CustomActivityTracker babyId={profile.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Activity Logs */}
          <div className="lg:col-span-1">
            <ActivityLogsList babyId={profile.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackActivity;
