import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { useFilteredActivityLogs } from '@/hooks/useFilteredActivityLogs';
import { format, startOfDay, eachDayOfInterval } from 'date-fns';
import { DateRange } from '@/utils/dateRangeUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Moon, 
  Sun, 
  Clock, 
  TrendingUp,
  Calendar,
  Zap,
  Activity
} from 'lucide-react';

interface DetailedSleepAnalyticsProps {
  babyId: string;
  dateRange: DateRange;
}

interface SleepStats {
  totalSessions: number;
  liveSessions: number;
  manualLogs: number;
  totalSleepHours: number;
  napSessions: number;
  nightSessions: number;
  avgSessionLength: number;
  longestSession: { duration: number; date: string } | null;
  shortestSession: { duration: number; date: string } | null;
}

interface DailySleepData {
  date: string;
  totalHours: number;
  naps: number;
  nightSleep: number;
  sessions: number;
}

const COLORS = {
  nap: '#10b981',
  night: '#6366f1',
  live: '#8b5cf6',
  manual: '#3b82f6'
};

const chartConfig = {
  totalHours: {
    label: "Total Sleep Hours",
    color: "#6366f1",
  },
  naps: {
    label: "Nap Hours",
    color: "#10b981",
  },
  nightSleep: {
    label: "Night Sleep Hours",
    color: "#6366f1",
  },
};

export const DetailedSleepAnalytics = ({ babyId, dateRange }: DetailedSleepAnalyticsProps) => {
  const { logs, loading } = useFilteredActivityLogs(babyId, dateRange);
  const [stats, setStats] = useState<SleepStats>({
    totalSessions: 0,
    liveSessions: 0,
    manualLogs: 0,
    totalSleepHours: 0,
    napSessions: 0,
    nightSessions: 0,
    avgSessionLength: 0,
    longestSession: null,
    shortestSession: null,
  });
  const [dailyData, setDailyData] = useState<DailySleepData[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (logs.length > 0) {
      processAnalytics();
    }
  }, [logs, dateRange]);

  const processAnalytics = () => {
    const sleepLogs = logs.filter(log => log.activity_type === 'sleep');
    
    if (sleepLogs.length === 0) {
      setStats({
        totalSessions: 0,
        liveSessions: 0,
        manualLogs: 0,
        totalSleepHours: 0,
        napSessions: 0,
        nightSessions: 0,
        avgSessionLength: 0,
        longestSession: null,
        shortestSession: null,
      });
      setDailyData([]);
      setPieData([]);
      return;
    }

    // Calculate stats
    const liveSessions = sleepLogs.filter(log => log.metadata?.tracking_method === 'live_session').length;
    const manualLogs = sleepLogs.filter(log => log.metadata?.tracking_method === 'manual_log').length;
    const napSessions = sleepLogs.filter(log => log.metadata?.sleep_type === 'nap').length;
    const nightSessions = sleepLogs.filter(log => log.metadata?.sleep_type === 'night').length;
    
    const totalMinutes = sleepLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    const avgLength = Math.round(totalMinutes / sleepLogs.length);

    // Find longest and shortest sessions
    const sortedByDuration = [...sleepLogs].sort((a, b) => 
      (b.duration_minutes || 0) - (a.duration_minutes || 0)
    );
    
    const longest = sortedByDuration[0];
    const shortest = sortedByDuration[sortedByDuration.length - 1];

    setStats({
      totalSessions: sleepLogs.length,
      liveSessions,
      manualLogs,
      totalSleepHours: totalHours,
      napSessions,
      nightSessions,
      avgSessionLength: avgLength,
      longestSession: longest ? {
        duration: longest.duration_minutes || 0,
        date: format(new Date(longest.start_time), 'MMM dd, h:mm a')
      } : null,
      shortestSession: shortest ? {
        duration: shortest.duration_minutes || 0,
        date: format(new Date(shortest.start_time), 'MMM dd, h:mm a')
      } : null,
    });

    // Process daily data
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    const dailyProcessed = days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySleepLogs = sleepLogs.filter(log => {
        const logDate = new Date(log.start_time);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const napMinutes = daySleepLogs
        .filter(log => log.metadata?.sleep_type === 'nap')
        .reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
      
      const nightMinutes = daySleepLogs
        .filter(log => log.metadata?.sleep_type === 'night')
        .reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

      return {
        date: format(day, 'MMM dd'),
        totalHours: Math.round((napMinutes + nightMinutes) / 60 * 10) / 10,
        naps: Math.round(napMinutes / 60 * 10) / 10,
        nightSleep: Math.round(nightMinutes / 60 * 10) / 10,
        sessions: daySleepLogs.length,
      };
    });

    setDailyData(dailyProcessed);

    // Pie chart data
    const napMinutes = sleepLogs
      .filter(log => log.metadata?.sleep_type === 'nap')
      .reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    
    const nightMinutes = sleepLogs
      .filter(log => log.metadata?.sleep_type === 'night')
      .reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

    setPieData([
      { name: 'Naps', value: Math.round(napMinutes / 60 * 10) / 10, color: COLORS.nap },
      { name: 'Night Sleep', value: Math.round(nightMinutes / 60 * 10) / 10, color: COLORS.night },
    ]);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const sleepLogs = logs.filter(log => log.activity_type === 'sleep');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-xs sm:text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats.totalSessions}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1 text-purple-600" />
                {stats.liveSessions} Live
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1 text-blue-600" />
                {stats.manualLogs} Manual
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Moon className="h-4 w-4 text-indigo-600" />
              <p className="text-xs sm:text-sm text-muted-foreground">Total Sleep</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats.totalSleepHours}h</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {stats.avgSessionLength} min/session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Sun className="h-4 w-4 text-green-600" />
              <p className="text-xs sm:text-sm text-muted-foreground">Naps</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats.napSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalSessions > 0 ? Math.round((stats.napSessions / stats.totalSessions) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Moon className="h-4 w-4 text-indigo-600" />
              <p className="text-xs sm:text-sm text-muted-foreground">Night Sleep</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats.nightSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalSessions > 0 ? Math.round((stats.nightSessions / stats.totalSessions) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Sleep Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Daily Sleep Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                    dataKey="naps" 
                    stroke={COLORS.nap}
                    strokeWidth={2}
                    dot={{ fill: COLORS.nap, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="nightSleep" 
                    stroke={COLORS.night}
                    strokeWidth={2}
                    dot={{ fill: COLORS.night, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sleep Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Sleep Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center">
              {pieData.length > 0 && pieData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}h`}
                      outerRadius={isMobile ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">No sleep data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Cards */}
      {stats.longestSession && stats.shortestSession && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-green-50">
            <CardContent className="p-3 sm:p-4">
              <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Longest Sleep Session</span>
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {Math.floor(stats.longestSession.duration / 60)}h {stats.longestSession.duration % 60}m
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {stats.longestSession.date}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardContent className="p-3 sm:p-4">
              <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Shortest Sleep Session</span>
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats.shortestSession.duration} min
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {stats.shortestSession.date}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Detailed Sleep Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sleepLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No sleep sessions recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  sleepLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.metadata?.tracking_method === 'live_session' ? (
                          <Badge variant="default" className="bg-purple-600">
                            <Zap className="h-3 w-3 mr-1" />
                            Live Session
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-600 text-blue-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Manual Log
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.metadata?.sleep_type === 'nap' ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Sun className="h-3 w-3 mr-1" />
                            Nap
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                            <Moon className="h-3 w-3 mr-1" />
                            Night
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(log.start_time), 'MMM dd, yyyy')}</div>
                          <div className="text-muted-foreground text-xs">
                            {format(new Date(log.start_time), 'h:mm a')}
                            {log.end_time && ` - ${format(new Date(log.end_time), 'h:mm a')}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {log.duration_minutes 
                            ? `${Math.floor(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-xs block">
                          {log.notes || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};