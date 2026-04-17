import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, format } from 'date-fns';

export type DateRangeOption =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'last7Days'
  | 'last14Days'
  | 'last30Days'
  | 'last7'
  | 'last14'
  | 'last30'
  | 'all'
  | string;

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export const getDateRange = (option: DateRangeOption): DateRange => {
  const now = new Date();

  switch (option) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now), label: 'Today' };

    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday), label: 'Yesterday' };

    case 'last7Days':
    case 'last7': {
      const sevenDaysAgo = subDays(now, 6); // Include today
      return { start: startOfDay(sevenDaysAgo), end: endOfDay(now), label: 'Last 7 Days' };
    }

    case 'last14Days':
    case 'last14': {
      const fourteenDaysAgo = subDays(now, 13); // Include today
      return { start: startOfDay(fourteenDaysAgo), end: endOfDay(now), label: 'Last 14 Days' };
    }

    case 'last30Days':
    case 'last30': {
      const thirtyDaysAgo = subDays(now, 29); // Include today
      return { start: startOfDay(thirtyDaysAgo), end: endOfDay(now), label: 'Last 30 Days' };
    }

    case 'all': {
      // Since birth / since tracking began: use a wide historical range
      const longAgo = new Date(2000, 0, 1);
      return { start: startOfDay(longAgo), end: endOfDay(now), label: 'Since birth' };
    }

    case 'thisWeek':
      return { start: startOfWeek(now), end: endOfWeek(now), label: 'This Week' };

    case 'lastWeek':
      const lastWeekStart = startOfWeek(subWeeks(now, 1));
      const lastWeekEnd = endOfWeek(subWeeks(now, 1));
      return { start: lastWeekStart, end: lastWeekEnd, label: 'Last Week' };

    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now), label: 'This Month' };

    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth), label: 'Last Month' };

    default:
      // Handle previous months (format: "month-YYYY-MM")
      if (option.startsWith('month-')) {
        const [, year, month] = option.split('-');
        const targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          start: startOfMonth(targetDate),
          end: endOfMonth(targetDate),
          label: format(targetDate, 'MMMM yyyy')
        };
      }
      // Default to last 30 days (safer than 'today' for reports)
      return getDateRange('last30Days');
  }
};

export const generateDateRangeOptions = (): { value: DateRangeOption; label: string }[] => {
  const options = [
    { value: 'today' as DateRangeOption, label: 'Today' },
    { value: 'yesterday' as DateRangeOption, label: 'Yesterday' },
    { value: 'last7Days' as DateRangeOption, label: 'Last 7 Days' },
    { value: 'last14Days' as DateRangeOption, label: 'Last 14 Days' },
    { value: 'last30Days' as DateRangeOption, label: 'Last 30 Days' },
    { value: 'thisWeek' as DateRangeOption, label: 'This Week' },
    { value: 'lastWeek' as DateRangeOption, label: 'Last Week' },
    { value: 'thisMonth' as DateRangeOption, label: 'This Month' },
    { value: 'lastMonth' as DateRangeOption, label: 'Last Month' },
  ];

  // Add previous 6 months
  const now = new Date();
  for (let i = 2; i <= 7; i++) {
    const monthDate = subMonths(now, i);
    const monthKey = `month-${format(monthDate, 'yyyy-MM')}`;
    options.push({
      value: monthKey as DateRangeOption,
      label: format(monthDate, 'MMMM yyyy')
    });
  }

  return options;
};
