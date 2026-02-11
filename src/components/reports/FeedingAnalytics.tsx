import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useFilteredActivityLogs } from '@/hooks/useFilteredActivityLogs';
import { format, startOfDay, eachDayOfInterval } from 'date-fns';
import { DateRange } from '@/utils/dateRangeUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Baby, PieChart as PieChartIcon } from 'lucide-react';

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
          <div className="h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-foreground">Feeding Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Daily Feedings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Baby className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              <span>Daily Feeding Frequency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedingData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: isMobile ? 9 : 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: isMobile ? 9 : 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <span>Feeding Types Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-48 sm:h-64 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feedingTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 55 : 80}
                    dataKey="count"
                    label={isMobile ? false : ({ type, count }) => `${type}: ${count}`}
                    labelLine={!isMobile}
                  >
                    {feedingTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {isMobile && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
