
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  User,
  LogOut,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { ReportsOverview } from '@/components/reports/ReportsOverview';
import { SleepAnalytics } from '@/components/reports/SleepAnalytics';
import { FeedingAnalytics } from '@/components/reports/FeedingAnalytics';
import { ActivitySummary } from '@/components/reports/ActivitySummary';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { DateRangeOption, getDateRange } from '@/utils/dateRangeUtils';
import { LanguageSelector } from '@/components/LanguageSelector';

const Reports = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useBabyProfile();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('today');
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

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">{t('pages.reports.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentDateRange = getDateRange(selectedDateRange);

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
        {/* Page Header with Back Button and Date Range Selector */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('navigation.backToDashboard')}</span>
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('pages.reports.title')}
              </h1>
              <p className="text-gray-600">
                {t('pages.reports.subtitle')}
              </p>
            </div>
            
            <DateRangeSelector 
              selectedRange={selectedDateRange}
              onRangeChange={setSelectedDateRange}
            />
          </div>
          
          <div className="text-sm text-gray-500">
            {t('pages.reports.showingData')} <span className="font-medium">{currentDateRange.label}</span>
          </div>
        </div>

        {/* Reports Content */}
        {profile ? (
          <div className="space-y-8">
            {/* Overview Cards */}
            <ReportsOverview babyId={profile.id} dateRange={currentDateRange} />
            
            {/* Sleep Analytics */}
            <SleepAnalytics babyId={profile.id} dateRange={currentDateRange} />
            
            {/* Feeding Analytics */}
            <FeedingAnalytics babyId={profile.id} dateRange={currentDateRange} />
            
            {/* Activity Summary */}
            <ActivitySummary babyId={profile.id} dateRange={currentDateRange} />
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('pages.reports.noBabyProfile')}</h3>
            <p className="text-gray-600 mb-4">{t('pages.reports.createProfileMessage')}</p>
            <Button onClick={() => navigate('/dashboard')}>
              {t('navigation.dashboard')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
