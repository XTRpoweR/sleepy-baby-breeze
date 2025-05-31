
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { 
  Moon, 
  Baby, 
  Heart, 
  Clock 
} from 'lucide-react';

interface ActivitySummaryProps {
  babyId: string;
}

interface WeeklySummary {
  totalActivities: number;
  sleepHours: number;
  feedingSessions: number;
  diaperChanges: number;
  avgSleepDuration: number;
  mostActiveDay: string;
}

export const ActivitySummary = ({ babyId }: ActivitySummaryProps) => {
  const { logs, loading } = useActivityLogs(babyId);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    totalActivities: 0,
    sleepHours: 0,
    feedingSessions: 0,
    diaperChanges: 0,
    avgSleepDuration: 0,
    mostActiveDay: ''
  });

  useEffect(() => {
    if (logs.length > 0) {
      calculateWeeklySummary();
    }
  }, [logs]);

  const calculateWeeklySummary = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Filter logs for this week
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.start_time);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    // Calculate totals
    const sleepLogs = weekLogs.filter(log => log.activity_type === 'sleep');
    const feedingLogs = weekLogs.filter(log => log.activity_type === 'feeding');
    const diaperLogs = weekLogs.filter(log => log.activity_type === 'diaper');

    const totalSleepMinutes = sleepLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0);
    const avgSleepDuration = sleepLogs.length > 0 ? totalSleepMinutes / sleepLogs.length : 0;

    // Find most active day
    const dailyActivity: Record<string, number> = {};
    weekLogs.forEach(log => {
      const day = format(new Date(log.start_time), 'EEEE');
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    const mostActiveDay = Object.entries(dailyActivity).reduce(
      (max, [day, count]) => count > max.count ? { day, count } : max,
      { day: 'No data', count: 0 }
    ).day;

    setWeeklySummary({
      totalActivities: weekLogs.length,
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
      label: 'Total Activities This Week',
      value: weeklySummary.totalActivities.toString(),
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      label: 'Total Sleep Hours',
      value: `${weeklySummary.sleepHours}h`,
      icon: Moon,
      color: 'text-purple-600'
    },
    {
      label: 'Feeding Sessions',
      value: weeklySummary.feedingSessions.toString(),
      icon: Baby,
      color: 'text-green-600'
    },
    {
      label: 'Diaper Changes',
      value: weeklySummary.diaperChanges.toString(),
      icon: Heart,
      color: 'text-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Weekly Activity Summary
        </CardTitle>
        <p className="text-sm text-gray-600">
          Overview of activities from {format(startOfWeek(new Date()), 'MMM dd')} to {format(endOfWeek(new Date()), 'MMM dd')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <IconComponent className={`h-8 w-8 ${item.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm text-gray-600">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Average Sleep Duration</h4>
            <p className="text-2xl font-bold text-blue-600">{weeklySummary.avgSleepDuration} min</p>
            <p className="text-sm text-gray-600">Per sleep session</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Most Active Day</h4>
            <p className="text-2xl font-bold text-green-600">{weeklySummary.mostActiveDay}</p>
            <p className="text-sm text-gray-600">This week</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
