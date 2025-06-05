import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilteredActivityLogs } from '@/hooks/useFilteredActivityLogs';
import { format } from 'date-fns';
import { 
  Moon, 
  Baby, 
  Heart, 
  Clock 
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
    // Calculate totals for the selected period
    const sleepLogs = logs.filter(log => log.activity_type === 'sleep');
    const feedingLogs = logs.filter(log => log.activity_type === 'feeding');
    const diaperLogs = logs.filter(log => log.activity_type === 'diaper');

    const totalSleepMinutes = sleepLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0);
    const avgSleepDuration = sleepLogs.length > 0 ? totalSleepMinutes / sleepLogs.length : 0;

    // Find most active day
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
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
      color: 'text-blue-600'
    },
    {
      label: 'Total Sleep Hours',
      value: `${periodSummary.sleepHours}h`,
      icon: Moon,
      color: 'text-purple-600'
    },
    {
      label: 'Feeding Sessions',
      value: periodSummary.feedingSessions.toString(),
      icon: Baby,
      color: 'text-green-600'
    },
    {
      label: 'Diaper Changes',
      value: periodSummary.diaperChanges.toString(),
      icon: Heart,
      color: 'text-orange-600'
    }
  ];

  return (
    <Card className="touch-manipulation">
      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
          Period Activity Summary
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Overview of activities from {format(dateRange.start, 'MMM dd')} to {format(dateRange.end, 'MMM dd')}
        </p>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {summaryItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg touch-manipulation">
                <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${item.color} flex-shrink-0 mx-auto sm:mx-0`} />
                <div className="text-center sm:text-left">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg touch-manipulation">
            <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Average Sleep Duration</h4>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{periodSummary.avgSleepDuration} min</p>
            <p className="text-xs sm:text-sm text-gray-600">Per sleep session</p>
          </div>
          
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg touch-manipulation">
            <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Most Active Day</h4>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{periodSummary.mostActiveDay}</p>
            <p className="text-xs sm:text-sm text-gray-600">In selected period</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
