
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
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-sm sm:text-base">{t('pages.reports.loading')}</p>
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
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        {/* Page Header with Back Button and Date Range Selector */}
        <div className="mb-6 lg:mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{t('navigation.backToDashboard')}</span>
          </Button>
          
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {t('pages.reports.title')}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {t('pages.reports.subtitle')}
                </p>
              </div>
              
              {/* Mobile Language Selector */}
              <div className="sm:hidden">
                <LanguageSelector />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-500">
                {t('pages.reports.showingData')} <span className="font-medium">{currentDateRange.label}</span>
              </div>
              
              <DateRangeSelector 
                selectedRange={selectedDateRange}
                onRangeChange={setSelectedDateRange}
              />
            </div>
          </div>
        </div>

        {/* Reports Content */}
        {profile ? (
          <div className="space-y-6 lg:space-y-8">
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
          <div className="text-center py-8 sm:py-12 px-4">
            <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{t('pages.reports.noBabyProfile')}</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">{t('pages.reports.createProfileMessage')}</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
              {t('navigation.dashboard')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
