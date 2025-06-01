
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateRangeOption, generateDateRangeOptions, getDateRange } from '@/utils/dateRangeUtils';

interface DateRangeSelectorProps {
  selectedRange: DateRangeOption;
  onRangeChange: (range: DateRangeOption) => void;
}

export const DateRangeSelector = ({ selectedRange, onRangeChange }: DateRangeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = generateDateRangeOptions();
  const currentRange = getDateRange(selectedRange);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 bg-white hover:bg-gray-50"
        >
          <Calendar className="h-4 w-4" />
          <span>Record Statistics</span>
          <span className="text-sm text-gray-500">({currentRange.label})</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              onRangeChange(option.value);
              setIsOpen(false);
            }}
            className={`cursor-pointer hover:bg-gray-100 ${
              selectedRange === option.value ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
