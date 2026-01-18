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
          <div className="h-6 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Feeding Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Feedings */}
        <Card>
          <CardContent className="p-3 sm:p-5">
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4">
              Daily Feeding Frequency
            </h3>
            <ChartContainer config={chartConfig} className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: isMobile ? 9 : 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    interval={isMobile ? 1 : 0}
                  />
                  <YAxis 
                    tick={{ fontSize: isMobile ? 9 : 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    width={isMobile ? 25 : 40}
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
          <CardContent className="p-3 sm:p-5">
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4">
              Feeding Types Distribution
            </h3>
            <ChartContainer config={{}} className="h-48 sm:h-64">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
