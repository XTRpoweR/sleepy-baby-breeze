
import { useMemo } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { DateRange } from '@/utils/dateRangeUtils';

export const useFilteredActivityLogs = (babyId: string, dateRange: DateRange) => {
  const { logs, loading, deleteLog, updateLog, refetchLogs } = useActivityLogs(babyId);

  const filteredLogs = useMemo(() => {
    if (!logs.length) return [];
    
    return logs.filter(log => {
      const logDate = new Date(log.start_time);
      return logDate >= dateRange.start && logDate <= dateRange.end;
    });
  }, [logs, dateRange]);

  return {
    logs: filteredLogs,
    loading,
    deleteLog,
    updateLog,
    refetchLogs
  };
};
