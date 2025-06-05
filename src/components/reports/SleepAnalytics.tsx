import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useFilteredActivityLogs } from '@/hooks/useFilteredActivityLogs';
import { format, startOfDay, eachDayOfInterval } from 'date-fns';
import { DateRange } from '@/utils/dateRangeUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SleepAnalyticsProps {
  babyId: string;
  dateRange: DateRange;
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

export const SleepAnalytics = ({ babyId, dateRange }: SleepAnalyticsProps) => {
  const { logs, loading } = useFilteredActivityLogs(babyId, dateRange);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (logs.length > 0) {
      processSleepData();
    } else {
      setSleepData([]);
    }
  }, [logs, dateRange]);

  const processSleepData = () => {
    const sleepLogs = logs.filter(log => log.activity_type === 'sleep');
    
    // Get all days in the date range
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    const processedData = days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySleepLogs = sleepLogs.filter(log => {
        const logDate = new Date(log.start_time);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const totalMinutes = daySleepLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
      
      return {
        date: format(day, 'MMM dd'),
        totalSleep: Math.round(totalMinutes / 60 * 10) / 10,
        sleepSessions: daySleepLogs.length,
        avgDuration: daySleepLogs.length > 0 ? Math.round(totalMinutes / daySleepLogs.length) : 0
      };
    });

    setSleepData(processedData);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Sleep Duration Trend */}
      <Card className="touch-manipulation">
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
            {t('components.reports.sleepDurationTrend')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <ChartContainer config={chartConfig} className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="totalSleep" 
                  stroke={chartConfig.totalSleep.color}
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ fill: chartConfig.totalSleep.color, strokeWidth: 2, r: isMobile ? 3 : 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Sleep Sessions */}
      <Card className="touch-manipulation">
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
            {t('components.reports.dailySleepSessions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <ChartContainer config={chartConfig} className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  axisLine={false}
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
