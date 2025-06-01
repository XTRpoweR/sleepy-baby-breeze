
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateRangeOption } from '@/utils/dateRangeUtils';
import { getLocalizedDateRangeLabel } from '@/utils/dateLocalization';

interface DateRangeSelectorProps {
  selectedRange: DateRangeOption;
  onRangeChange: (range: DateRangeOption) => void;
}

export const DateRangeSelector = ({ selectedRange, onRangeChange }: DateRangeSelectorProps) => {
  const { i18n } = useTranslation();

  const dateRangeOptions: DateRangeOption[] = [
    'today',
    'yesterday', 
    'last7Days',
    'last30Days',
    'thisWeek',
    'lastWeek',
    'thisMonth',
    'lastMonth'
  ];

  const getLocalizedLabel = (range: DateRangeOption) => {
    return getLocalizedDateRangeLabel(range, i18n.language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2 min-w-[160px]">
          <Calendar className="h-4 w-4" />
          <span>{getLocalizedLabel(selectedRange)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {dateRangeOptions.map((range) => (
          <DropdownMenuItem
            key={range}
            onClick={() => onRangeChange(range)}
            className={`cursor-pointer ${
              selectedRange === range ? 'bg-blue-50 font-medium' : ''
            }`}
          >
            {getLocalizedLabel(range)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
