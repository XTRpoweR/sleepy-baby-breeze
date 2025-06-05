
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
import { useIsMobile } from '@/hooks/use-mobile';

interface DateRangeSelectorProps {
  selectedRange: DateRangeOption;
  onRangeChange: (range: DateRangeOption) => void;
}

export const DateRangeSelector = ({ selectedRange, onRangeChange }: DateRangeSelectorProps) => {
  const { i18n } = useTranslation();
  const isMobile = useIsMobile();

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
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 min-w-[140px] sm:min-w-[160px] text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-3"
          size={isMobile ? "sm" : "default"}
        >
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">{getLocalizedLabel(selectedRange)}</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-44 sm:w-48 bg-white shadow-lg border z-50"
        sideOffset={4}
      >
        {dateRangeOptions.map((range) => (
          <DropdownMenuItem
            key={range}
            onClick={() => onRangeChange(range)}
            className={`cursor-pointer text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 ${
              selectedRange === range 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'hover:bg-gray-50'
            }`}
          >
            {getLocalizedLabel(range)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
