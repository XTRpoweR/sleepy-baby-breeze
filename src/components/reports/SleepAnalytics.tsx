
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format, subDays, startOfDay } from 'date-fns';

interface SleepAnalyticsProps {
  babyId: string;
}

interface SleepData {
  date: string;
  totalSleep: number;
  sleepSessions: number;
  avgDuration: number;
}

const chartConfig = {
  totalSleep: {
    label: "Total Sleep (hours)",
    color: "#3b82f6",
  },
  sleepSessions: {
    label: "Sleep Sessions",
    color: "#8b5cf6",
  },
  avgDuration: {
    label: "Avg Duration (minutes)",
    color: "#10b981",
  },
};

export const SleepAnalytics = ({ babyId }: SleepAnalyticsProps) => {
  const { logs, loading } = useActivityLogs(babyId);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);

  useEffect(() => {
    if (logs.length > 0) {
      processSleepData();
    }
  }, [logs]);

  const processSleepData = () => {
    const sleepLogs = logs.filter(log => log.activity_type === 'sleep');
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), i));
      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        totalSleep: 0,
        sleepSessions: 0,
        avgDuration: 0
      };
    }).reverse();

    // Process sleep data for each day
    last7Days.forEach(day => {
      const daySleepLogs = sleepLogs.filter(log => {
        const logDate = startOfDay(new Date(log.start_time));
        return logDate.getTime() === day.fullDate.getTime();
      });

      if (daySleepLogs.length > 0) {
        const totalMinutes = daySleepLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
        day.totalSleep = Math.round(totalMinutes / 60 * 10) / 10; // Convert to hours
        day.sleepSessions = daySleepLogs.length;
        day.avgDuration = Math.round(totalMinutes / daySleepLogs.length);
      }
    });

    setSleepData(last7Days.map(({ fullDate, ...rest }) => rest));
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sleep Duration Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Sleep Duration Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="totalSleep" 
                  stroke={chartConfig.totalSleep.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig.totalSleep.color, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Sleep Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Daily Sleep Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="sleepSessions" 
                  fill={chartConfig.sleepSessions.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
