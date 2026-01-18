import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { ReportsOverview } from '@/components/reports/ReportsOverview';
import { DetailedSleepAnalytics } from '@/components/reports/DetailedSleepAnalytics';
import { FeedingAnalytics } from '@/components/reports/FeedingAnalytics';
import { ActivitySummary } from '@/components/reports/ActivitySummary';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { ProfileSelector } from '@/components/profiles/ProfileSelector';
import { MobileProfileSelector } from '@/components/profiles/MobileProfileSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRangeOption, getDateRange } from '@/utils/dateRangeUtils';

const Reports = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useBabyProfile();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('today');
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-soft gradient-dynamic-slow flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground text-sm sm:text-base">{t('pages.reports.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentDateRange = getDateRange(selectedDateRange);

  return (
    <div className="min-h-screen bg-soft gradient-dynamic-slow">
      <UnifiedHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8">
        {/* Page Header with Back Button and Date Range Selector */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="mb-3 sm:mb-4 flex items-center space-x-2 text-muted-foreground hover:text-foreground text-sm sm:text-base p-2 sm:p-3 -ml-2 sm:-ml-3"
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{t('navigation.backToDashboard')}</span>
          </Button>
          
          <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2 leading-tight">
                    {t('pages.reports.title')}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {t('pages.reports.subtitle')}
                  </p>
                </div>
                
                {/* Active Profile Selector */}
                <div className="flex items-center gap-3">
                  {isMobile ? <MobileProfileSelector /> : <ProfileSelector />}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                    {t('pages.reports.showingData')} <span className="font-medium">{currentDateRange.label}</span>
                  </div>
                  
                  <div className="order-1 sm:order-2 flex justify-end">
                    <DateRangeSelector 
                      selectedRange={selectedDateRange}
                      onRangeChange={setSelectedDateRange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Content */}
        {profile ? (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Overview Cards */}
            <section aria-label="Overview Statistics">
              <ReportsOverview babyId={profile.id} dateRange={currentDateRange} />
            </section>
            
            {/* Detailed Sleep Analytics */}
            <section aria-label="Detailed Sleep Analytics">
              <DetailedSleepAnalytics babyId={profile.id} dateRange={currentDateRange} />
            </section>
            
            {/* Feeding Analytics */}
            <section aria-label="Feeding Analytics">
              <FeedingAnalytics babyId={profile.id} dateRange={currentDateRange} />
            </section>
            
            {/* Activity Summary */}
            <section aria-label="Activity Summary">
              <ActivitySummary babyId={profile.id} dateRange={currentDateRange} />
            </section>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
            <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">{t('pages.reports.noBabyProfile')}</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base max-w-md mx-auto leading-relaxed">{t('pages.reports.createProfileMessage')}</p>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full sm:w-auto min-w-[120px]"
              size={isMobile ? "default" : "lg"}
            >
              {t('navigation.dashboard')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
