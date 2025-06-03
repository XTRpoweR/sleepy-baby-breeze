import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilteredActivityLogs } from '@/hooks/useFilteredActivityLogs';
import { 
  Moon, 
  Baby, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { DateRange } from '@/utils/dateRangeUtils';

interface ReportsOverviewProps {
  babyId: string;
  dateRange: DateRange;
}

interface OverviewStats {
  totalSleep: number;
  avgSleepDuration: number;
  totalFeedings: number;
  totalActivities: number;
}

export const ReportsOverview = ({ babyId, dateRange }: ReportsOverviewProps) => {
  const { logs, loading } = useFilteredActivityLogs(babyId, dateRange);
  const [stats, setStats] = useState<OverviewStats>({
    totalSleep: 0,
    avgSleepDuration: 0,
    totalFeedings: 0,
    totalActivities: 0
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (logs.length > 0) {
      calculateStats();
    } else {
      setStats({
        totalSleep: 0,
        avgSleepDuration: 0,
        totalFeedings: 0,
        totalActivities: 0
      });
    }
  }, [logs]);

  const calculateStats = () => {
    const sleepLogs = logs.filter(log => log.activity_type === 'sleep');
    const totalSleepMinutes = sleepLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0);
    const avgSleepMinutes = sleepLogs.length > 0 ? totalSleepMinutes / sleepLogs.length : 0;

    const feedingLogs = logs.filter(log => log.activity_type === 'feeding');
    
    setStats({
      totalSleep: Math.round(totalSleepMinutes / 60 * 10) / 10,
      avgSleepDuration: Math.round(avgSleepMinutes),
      totalFeedings: feedingLogs.length,
      totalActivities: logs.length
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16 mb-1"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-20 sm:w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overviewCards = [
    {
      title: t('components.reports.totalSleep'),
      value: `${stats.totalSleep}h`,
      description: t('components.reports.hoursOfSleep'),
      icon: Moon,
      color: "text-blue-600"
    },
    {
      title: t('components.reports.avgSleepDuration'),
      value: `${stats.avgSleepDuration}m`,
      description: t('components.reports.perSleepSession'),
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: t('components.reports.totalFeedings'),
      value: stats.totalFeedings.toString(),
      description: t('components.reports.feedingSessions'),
      icon: Baby,
      color: "text-purple-600"
    },
    {
      title: t('components.reports.totalActivities'),
      value: stats.totalActivities.toString(),
      description: t('components.reports.allActivities'),
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {overviewCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
