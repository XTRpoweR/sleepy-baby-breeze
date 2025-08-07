
import { useMemo } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { DateRange } from '@/utils/dateRangeUtils';

export const useFilteredActivityLogs = (babyId: string, dateRange: DateRange) => {
  const { logs, loading, deleteLog, updateLog, refetchLogs } = useActivityLogs(babyId);

  const filteredLogs = useMemo(() => {
    if (!logs.length) return [];
    
    return logs.filter(log => {
      const logDate = new Date(log.start_time);
      // Ensure we're comparing dates correctly by using the full date range
      return logDate >= dateRange.start && logDate <= dateRange.end;
    });
  }, [logs, dateRange.start, dateRange.end]);

  return {
    logs: filteredLogs,
    loading,
    deleteLog,
    updateLog,
    refetchLogs
  };
};
