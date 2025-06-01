
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  User,
  LogOut,
  ArrowLeft,
  Music,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SoundsLibrary } from '@/components/sounds/SoundsLibrary';
import { SleepArticles } from '@/components/sleep-schedule/SleepArticles';
import { LanguageSelector } from '@/components/LanguageSelector';

const Sounds = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <p className="text-gray-600">{t('pages.sounds.loading')}</p>
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
              <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
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
                <span>{t('navigation.signOut')}</span>
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
            <span>{t('navigation.backToDashboard')}</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('pages.sounds.title')}
          </h1>
          <p className="text-gray-600">
            {t('pages.sounds.subtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-blue-50 p-1 rounded-lg">
            <TabsTrigger 
              value="guides" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-blue-600 rounded-md py-3 px-6 font-medium transition-all"
            >
              <BookOpen className="h-4 w-4" />
              <span>{t('pages.sounds.guidesTab')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sounds" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-blue-600 rounded-md py-3 px-6 font-medium transition-all"
            >
              <Music className="h-4 w-4" />
              <span>{t('pages.sounds.soundsTab')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="mt-0">
            <SleepArticles />
          </TabsContent>

          <TabsContent value="sounds" className="mt-0">
            <SoundsLibrary />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Sounds;
