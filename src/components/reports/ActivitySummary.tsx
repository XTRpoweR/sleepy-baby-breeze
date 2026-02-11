import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilteredActivityLogs } from '@/hooks/useFilteredActivityLogs';
import { format } from 'date-fns';
import { 
  Moon, 
  Baby, 
  Heart, 
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { DateRange } from '@/utils/dateRangeUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActivitySummaryProps {
  babyId: string;
  dateRange: DateRange;
}

interface PeriodSummary {
  totalActivities: number;
  sleepHours: number;
  feedingSessions: number;
  diaperChanges: number;
  avgSleepDuration: number;
  mostActiveDay: string;
}

export const ActivitySummary = ({ babyId, dateRange }: ActivitySummaryProps) => {
  const { logs, loading } = useFilteredActivityLogs(babyId, dateRange);
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary>({
    totalActivities: 0,
    sleepHours: 0,
    feedingSessions: 0,
    diaperChanges: 0,
    avgSleepDuration: 0,
    mostActiveDay: ''
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (logs.length > 0) {
      calculatePeriodSummary();
    } else {
      setPeriodSummary({
        totalActivities: 0,
        sleepHours: 0,
        feedingSessions: 0,
        diaperChanges: 0,
        avgSleepDuration: 0,
        mostActiveDay: 'No data'
      });
    }
  }, [logs, dateRange]);

  const calculatePeriodSummary = () => {
    const sleepLogs = logs.filter(log => log.activity_type === 'sleep');
    const feedingLogs = logs.filter(log => log.activity_type === 'feeding');
    const diaperLogs = logs.filter(log => log.activity_type === 'diaper');

    const totalSleepMinutes = sleepLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0);
    const avgSleepDuration = sleepLogs.length > 0 ? totalSleepMinutes / sleepLogs.length : 0;

    const dailyActivity: Record<string, number> = {};
    logs.forEach(log => {
      const day = format(new Date(log.start_time), 'EEEE');
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    const mostActiveDay = Object.entries(dailyActivity).reduce(
      (max, [day, count]) => count > max.count ? { day, count } : max,
      { day: 'No data', count: 0 }
    ).day;

    setPeriodSummary({
      totalActivities: logs.length,
      sleepHours: Math.round(totalSleepMinutes / 60 * 10) / 10,
      feedingSessions: feedingLogs.length,
      diaperChanges: diaperLogs.length,
      avgSleepDuration: Math.round(avgSleepDuration),
      mostActiveDay
    });
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const summaryItems = [
    {
      label: 'Total Activities',
      value: periodSummary.totalActivities.toString(),
      icon: Clock,
      color: 'text-blue-600',
      bgFrom: 'from-blue-50',
      bgTo: 'to-blue-100',
      iconBg: 'from-blue-200 to-blue-300'
    },
    {
      label: 'Total Sleep Hours',
      value: `${periodSummary.sleepHours}h`,
      icon: Moon,
      color: 'text-purple-600',
      bgFrom: 'from-purple-50',
      bgTo: 'to-purple-100',
      iconBg: 'from-purple-200 to-purple-300'
    },
    {
      label: 'Feeding Sessions',
      value: periodSummary.feedingSessions.toString(),
      icon: Baby,
      color: 'text-green-600',
      bgFrom: 'from-green-50',
      bgTo: 'to-green-100',
      iconBg: 'from-green-200 to-green-300'
    },
    {
      label: 'Diaper Changes',
      value: periodSummary.diaperChanges.toString(),
      icon: Heart,
      color: 'text-orange-600',
      bgFrom: 'from-orange-50',
      bgTo: 'to-orange-100',
      iconBg: 'from-orange-200 to-orange-300'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-foreground">Period Activity Summary</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index} className={`border-0 shadow-md bg-gradient-to-br ${item.bgFrom} ${item.bgTo}`}>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className={`bg-gradient-to-br ${item.iconBg} rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                  <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{item.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-foreground text-sm">Average Sleep Duration</h4>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-700">{periodSummary.avgSleepDuration} min</p>
            <p className="text-xs text-muted-foreground mt-1">Per sleep session</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-foreground text-sm">Most Active Day</h4>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-700">{periodSummary.mostActiveDay}</p>
            <p className="text-xs text-muted-foreground mt-1">In selected period</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
