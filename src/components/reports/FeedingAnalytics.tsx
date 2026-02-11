import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useFilteredActivityLogs } from '@/hooks/useFilteredActivityLogs';
import { format, startOfDay, eachDayOfInterval } from 'date-fns';
import { DateRange } from '@/utils/dateRangeUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeedingAnalyticsProps {
  babyId: string;
  dateRange: DateRange;
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

export const FeedingAnalytics = ({ babyId, dateRange }: FeedingAnalyticsProps) => {
  const { logs, loading } = useFilteredActivityLogs(babyId, dateRange);
  const [feedingData, setFeedingData] = useState<FeedingData[]>([]);
  const [feedingTypes, setFeedingTypes] = useState<FeedingTypeData[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (logs.length > 0) {
      processFeedingData();
    } else {
      setFeedingData([]);
      setFeedingTypes([]);
    }
  }, [logs, dateRange]);

  const processFeedingData = () => {
    const feedingLogs = logs.filter(log => log.activity_type === 'feeding');
    
    // Process daily feeding data
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    const processedData = days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayFeedingLogs = feedingLogs.filter(log => {
        const logDate = new Date(log.start_time);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      return {
        date: format(day, 'MMM dd'),
        feedings: dayFeedingLogs.length,
        totalDuration: dayFeedingLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0)
      };
    });

    setFeedingData(processedData);

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
    <div className="my-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Feeding Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Feedings */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Daily Feeding Frequency
          </h3>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
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
        </div>

        {/* Feeding Types */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Feeding Types Distribution
          </h3>
          <ChartContainer config={{}} className="h-48 sm:h-64 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feedingTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 60 : 90}
                  dataKey="count"
                  label={isMobile ? false : ({ type, count }) => `${type}: ${count}`}
                  labelLine={!isMobile}
                >
                  {feedingTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};
