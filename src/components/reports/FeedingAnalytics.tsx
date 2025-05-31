
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format, subDays, startOfDay } from 'date-fns';

interface FeedingAnalyticsProps {
  babyId: string;
}

interface FeedingData {
  date: string;
  feedings: number;
  totalDuration: number;
}

interface FeedingTypeData {
  type: string;
  count: number;
  color: string;
}

const chartConfig = {
  feedings: {
    label: "Feedings",
    color: "#f59e0b",
  },
  totalDuration: {
    label: "Total Duration (minutes)",
    color: "#ef4444",
  },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const FeedingAnalytics = ({ babyId }: FeedingAnalyticsProps) => {
  const { logs, loading } = useActivityLogs(babyId);
  const [feedingData, setFeedingData] = useState<FeedingData[]>([]);
  const [feedingTypes, setFeedingTypes] = useState<FeedingTypeData[]>([]);

  useEffect(() => {
    if (logs.length > 0) {
      processFeedingData();
    }
  }, [logs]);

  const processFeedingData = () => {
    const feedingLogs = logs.filter(log => log.activity_type === 'feeding');
    
    // Process daily feeding data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), i));
      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        feedings: 0,
        totalDuration: 0
      };
    }).reverse();

    last7Days.forEach(day => {
      const dayFeedingLogs = feedingLogs.filter(log => {
        const logDate = startOfDay(new Date(log.start_time));
        return logDate.getTime() === day.fullDate.getTime();
      });

      day.feedings = dayFeedingLogs.length;
      day.totalDuration = dayFeedingLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    });

    setFeedingData(last7Days.map(({ fullDate, ...rest }) => rest));

    // Process feeding types
    const typeCount: Record<string, number> = {};
    feedingLogs.forEach(log => {
      const feedingType = log.metadata?.feeding_type || 'bottle';
      typeCount[feedingType] = (typeCount[feedingType] || 0) + 1;
    });

    const typeData = Object.entries(typeCount).map(([type, count], index) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      color: COLORS[index % COLORS.length]
    }));

    setFeedingTypes(typeData);
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
      {/* Daily Feedings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Daily Feeding Frequency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedingData}>
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
                  dataKey="feedings" 
                  fill={chartConfig.feedings.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Feeding Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Feeding Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feedingTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ type, count }) => `${type}: ${count}`}
                >
                  {feedingTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
