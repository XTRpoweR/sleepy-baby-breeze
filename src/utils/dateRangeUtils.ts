
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, format } from 'date-fns';

export type DateRangeOption = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | string; // string for previous months

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export const getDateRange = (option: DateRangeOption): DateRange => {
  const now = new Date();
  
  switch (option) {
    case 'today':
      return {
        start: startOfDay(now),
        end: endOfDay(now),
        label: 'Today'
      };
      
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
        label: 'Yesterday'
      };
      
    case 'thisWeek':
      return {
        start: startOfWeek(now),
        end: endOfWeek(now),
        label: 'This Week'
      };
      
    case 'lastWeek':
      const lastWeekStart = startOfWeek(subWeeks(now, 1));
      const lastWeekEnd = endOfWeek(subWeeks(now, 1));
      return {
        start: lastWeekStart,
        end: lastWeekEnd,
        label: 'Last Week'
      };
      
    case 'thisMonth':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: 'This Month'
      };
      
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
      
      // Default to today
      return getDateRange('today');
  }
};

export const generateDateRangeOptions = (): { value: DateRangeOption; label: string }[] => {
  const options = [
    { value: 'today' as DateRangeOption, label: 'Today' },
    { value: 'yesterday' as DateRangeOption, label: 'Yesterday' },
    { value: 'thisWeek' as DateRangeOption, label: 'This Week' },
    { value: 'lastWeek' as DateRangeOption, label: 'Last Week' },
    { value: 'thisMonth' as DateRangeOption, label: 'This Month' },
  ];
  
  // Add previous 6 months
  const now = new Date();
  for (let i = 1; i <= 6; i++) {
    const monthDate = subMonths(now, i);
    const monthKey = `month-${format(monthDate, 'yyyy-MM')}`;
    options.push({
      value: monthKey as DateRangeOption,
      label: format(monthDate, 'MMMM yyyy')
    });
  }
  
  return options;
};
