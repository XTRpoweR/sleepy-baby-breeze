
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, ArrowLeft, Baby, Plus, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { ResponsiveSoundsLibrary } from '@/components/sounds/ResponsiveSoundsLibrary';
import { SleepArticles } from '@/components/sleep-schedule/SleepArticles';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { MobileProfileSelector } from '@/components/profiles/MobileProfileSelector';
import { ProfileManagementDialog } from '@/components/profiles/ProfileManagementDialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';

const Sounds = () => {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const {
    activeProfile,
    profiles,
    loading: profileLoading
  } = useBabyProfile();
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
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

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleAddProfile = () => {
    setShowProfileManagement(true);
  };

  const handleManageProfiles = () => {
    setShowProfileManagement(true);
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Volume2 className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard} 
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{t('navigation.backToDashboard')}</span>
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t('pages.sounds.title')}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {t('pages.sounds.subtitle')}
              </p>
            </div>
            
            {/* Profile Selector */}
            <div className="flex justify-end items-center space-x-4">
              {/* Commenting out the profile selector for now */}
              {/* <div className="hidden lg:block">
                <ProfileSelector />
              </div> */}
              
              {/* <div className="lg:hidden w-full">
                <MobileProfileSelector />
              </div> */}
              
              <div className="sm:hidden">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>

        {activeProfile ? (
          <Tabs defaultValue="sounds" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="sounds" className="flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm">
                <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{t('pages.sounds.soundsTab')}</span>
              </TabsTrigger>
              <TabsTrigger value="sleep-tips" className="flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Sleep Articles & Tips</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sounds" className="space-y-6">
              <ResponsiveSoundsLibrary />
            </TabsContent>

            <TabsContent value="sleep-tips" className="space-y-6">
              <SleepArticles />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 sm:p-8 text-center">
              <Baby className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {t('dashboard.createProfile')}
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {t('dashboard.noProfileMessage')}
              </p>
              <Button onClick={handleAddProfile} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.addProfile')}
              </Button>
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

export default Sounds;
