
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { 
  Moon, 
  Baby, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

interface ReportsOverviewProps {
  babyId: string;
}

interface OverviewStats {
  totalSleepToday: number;
  avgSleepDuration: number;
  totalFeedings: number;
  nightWakeups: number;
}

export const ReportsOverview = ({ babyId }: ReportsOverviewProps) => {
  const { logs, loading } = useActivityLogs(babyId);
  const [stats, setStats] = useState<OverviewStats>({
    totalSleepToday: 0,
    avgSleepDuration: 0,
    totalFeedings: 0,
    nightWakeups: 0
  });

  useEffect(() => {
    if (logs.length > 0) {
      calculateStats();
    }
  }, [logs]);

  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter today's activities
    const todayLogs = logs.filter(log => {
      const logDate = new Date(log.start_time);
      return logDate >= today;
    });

    // Calculate sleep stats
    const sleepLogs = todayLogs.filter(log => log.activity_type === 'sleep');
    const totalSleepMinutes = sleepLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0);
    
    // Calculate average sleep duration over last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSleepLogs = logs.filter(log => 
      log.activity_type === 'sleep' && new Date(log.start_time) >= weekAgo
    );
    const avgSleepMinutes = weekSleepLogs.length > 0 
      ? weekSleepLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0) / weekSleepLogs.length
      : 0;

    // Count feedings today
    const feedingLogs = todayLogs.filter(log => log.activity_type === 'feeding');
    
    // Count night wakeups (sleep sessions between 10PM and 6AM)
    const nightWakeups = sleepLogs.filter(log => {
      const hour = new Date(log.start_time).getHours();
      return hour >= 22 || hour <= 6;
    }).length;

    setStats({
      totalSleepToday: Math.round(totalSleepMinutes / 60 * 10) / 10, // hours with 1 decimal
      avgSleepDuration: Math.round(avgSleepMinutes),
      totalFeedings: feedingLogs.length,
      nightWakeups: nightWakeups
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Total Sleep Today",
      value: `${stats.totalSleepToday}h`,
      description: "Hours of sleep",
      icon: Moon,
      color: "text-blue-600"
    },
    {
      title: "Avg Sleep Duration",
      value: `${stats.avgSleepDuration}m`,
      description: "Per sleep session",
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Feedings Today",
      value: stats.totalFeedings.toString(),
      description: "Total feedings",
      icon: Baby,
      color: "text-purple-600"
    },
    {
      title: "Night Wakeups",
      value: stats.nightWakeups.toString(),
      description: "Sleep sessions",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
