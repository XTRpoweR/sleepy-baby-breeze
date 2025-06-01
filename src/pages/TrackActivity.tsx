
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
  DropletIcon as Bottle,
  Heart,
  Plus,
  ArrowLeft,
  Clock,
  History,
  Settings
} from 'lucide-react';
import { SleepTracker } from '@/components/tracking/SleepTracker';
import { FeedingTracker } from '@/components/tracking/FeedingTracker';
import { DiaperTracker } from '@/components/tracking/DiaperTracker';
import { CustomActivityTracker } from '@/components/tracking/CustomActivityTracker';
import { ActivityLogsList } from '@/components/tracking/ActivityLogsList';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useActivityLogs } from '@/hooks/useActivityLogs';

const TrackActivity = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { activeProfile, profiles, loading: profileLoading, createProfile } = useBabyProfile();
  const { logs, loading: logsLoading, deleteLog, updateLog, refetchLogs } = useActivityLogs(activeProfile?.id || '');
  const [activeTab, setActiveTab] = useState('sleep');
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAddProfile = () => {
    setShowProfileManagement(true);
  };

  const handleManageProfiles = () => {
    setShowProfileManagement(true);
  };

  const handleActivityAdded = () => {
    // Refresh the activity logs immediately after adding an activity
    refetchLogs();
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Baby className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">{t('pages.trackActivity.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('navigation.backToDashboard')}
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
              {t('navigation.back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('pages.trackActivity.title')}</h1>
              {activeProfile && (
                <p className="text-gray-600">{t('pages.trackActivity.subtitle', { name: activeProfile.name })}</p>
              )}
            </div>
          </div>
          
          {/* Profile Selector and Language Selector */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <ProfileSelector 
              onAddProfile={handleAddProfile}
              onManageProfiles={handleManageProfiles}
            />
          </div>
        </div>

        {activeProfile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Tracking */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="sleep" className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>{t('activities.sleep')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="feeding" className="flex items-center space-x-2">
                    <Bottle className="h-4 w-4" />
                    <span>{t('activities.feeding')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="diaper" className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>{t('activities.diaper')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>{t('activities.custom')}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sleep">
                  <SleepTracker babyId={activeProfile.id} onActivityAdded={handleActivityAdded} />
                </TabsContent>

                <TabsContent value="feeding">
                  <FeedingTracker babyId={activeProfile.id} onActivityAdded={handleActivityAdded} />
                </TabsContent>

                <TabsContent value="diaper">
                  <DiaperTracker babyId={activeProfile.id} onActivityAdded={handleActivityAdded} />
                </TabsContent>

                <TabsContent value="custom">
                  <CustomActivityTracker babyId={activeProfile.id} onActivityAdded={handleActivityAdded} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Activity Logs */}
            <div className="lg:col-span-1">
              <ActivityLogsList 
                babyId={activeProfile.id}
                logs={logs}
                loading={logsLoading}
                deleteLog={deleteLog}
                updateLog={updateLog}
                onActivityUpdated={handleActivityAdded}
              />
            </div>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('pages.trackActivity.noActiveProfile')}</h3>
              <p className="text-gray-600 mb-4">
                {t('pages.trackActivity.selectProfileMessage')}
              </p>
              <Button onClick={handleAddProfile} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.addProfile')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Management Dialog */}
      <ProfileManagementDialog 
        isOpen={showProfileManagement}
        onClose={() => setShowProfileManagement(false)}
      />
    </div>
  );
};

export default TrackActivity;
