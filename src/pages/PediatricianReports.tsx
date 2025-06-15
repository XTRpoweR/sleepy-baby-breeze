
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  Baby,
  ArrowLeft,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';

const PediatricianReports = () => {
  const { user, loading } = useAuth();
  const { activeProfile } = useBabyProfile();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGenerateReport = (reportType: string) => {
    // TODO: Implement report generation logic
    console.log(`Generating ${reportType} report for ${activeProfile?.name}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const reportTypes = [
    {
      id: 'comprehensive',
      title: 'Comprehensive Health Report',
      description: 'Complete overview of sleep, feeding, and development patterns',
      icon: BarChart3,
      timeframe: 'Last 30 days'
    },
    {
      id: 'sleep-analysis',
      title: 'Sleep Pattern Analysis',
      description: 'Detailed sleep tracking data and trends',
      icon: Clock,
      timeframe: 'Last 14 days'
    },
    {
      id: 'growth-tracking',
      title: 'Growth & Development Report',
      description: 'Milestones and developmental progress tracking',
      icon: TrendingUp,
      timeframe: 'Since birth'
    }
  ];

  const ReportContent = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <div className="text-center mb-8">
        <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.pediatricianReports')}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('dashboard.pediatricianReportsDesc')}
        </p>
        {activeProfile && (
          <p className="text-sm text-gray-500 mt-2">
            Reports for {activeProfile.name}
          </p>
        )}
      </div>

      {/* Active Profile Check */}
      {!activeProfile ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Baby className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Selected</h3>
            <p className="text-gray-600 mb-4">
              Please select a child profile to generate pediatrician reports.
            </p>
            <Button onClick={handleBackToDashboard}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Report Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                      <IconComponent className="h-6 w-6 text-teal-600" />
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {report.timeframe}
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleGenerateReport(report.id)}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Reports are generated based on your tracked data</li>
                <li>• Professional formatting suitable for healthcare providers</li>
                <li>• Downloadable as PDF for easy sharing</li>
                <li>• Data includes sleep patterns, feeding schedules, and milestones</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <FeatureGate 
          feature="pediatrician" 
          fallback={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Pediatrician Reports - Premium Feature
              </h2>
              <p className="text-gray-600 mb-6">
                Upgrade to Premium to generate professional reports for your healthcare provider.
              </p>
            </div>
          }
        >
          <ReportContent />
        </FeatureGate>
      </main>
    </div>
  );
};

export default PediatricianReports;
