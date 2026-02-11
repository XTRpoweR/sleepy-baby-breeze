import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { useFilteredActivityLogs } from '@/hooks/useFilteredActivityLogs';
import { 
  Moon, 
  Baby, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { DateRange } from '@/utils/dateRangeUtils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3 sm:p-4">
              <div className="h-10 w-10 bg-muted rounded-xl mx-auto mb-3"></div>
              <div className="h-6 bg-muted rounded w-16 mx-auto mb-1"></div>
              <div className="h-3 bg-muted rounded w-20 mx-auto"></div>
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
      color: "text-indigo-600",
      bgFrom: "from-indigo-50",
      bgTo: "to-indigo-100",
      iconBg: "from-indigo-200 to-indigo-300"
    },
    {
      title: t('components.reports.avgSleepDuration'),
      value: `${stats.avgSleepDuration}m`,
      description: t('components.reports.perSleepSession'),
      icon: Clock,
      color: "text-green-600",
      bgFrom: "from-green-50",
      bgTo: "to-green-100",
      iconBg: "from-green-200 to-green-300"
    },
    {
      title: t('components.reports.totalFeedings'),
      value: stats.totalFeedings.toString(),
      description: t('components.reports.feedingSessions'),
      icon: Baby,
      color: "text-amber-600",
      bgFrom: "from-amber-50",
      bgTo: "to-amber-100",
      iconBg: "from-amber-200 to-amber-300"
    },
    {
      title: t('components.reports.totalActivities'),
      value: stats.totalActivities.toString(),
      description: t('components.reports.allActivities'),
      icon: TrendingUp,
      color: "text-rose-600",
      bgFrom: "from-rose-50",
      bgTo: "to-rose-100",
      iconBg: "from-rose-200 to-rose-300"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-foreground">Summary Statistics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {overviewCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={index} 
              className={`border-0 shadow-md bg-gradient-to-br ${card.bgFrom} ${card.bgTo}`}
            >
              <CardContent className="p-3 sm:p-4 text-center">
                <div className={`bg-gradient-to-br ${card.iconBg} rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                  <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${card.color}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5">
                  {card.value}
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground/70 mt-0.5">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
