import {
  FormControl,
  MenuItem as MuiMenuItem,
  Select as MuiSelect,
} from '@mui/material';
import React from 'react';
import Input from './Input';

export interface CustomDateRange {
  start: string;
  end: string;
}

interface DateRangeFilterProps {
  timeFilter: string;
  setTimeFilter: (val: string) => void;
  customDateRange: CustomDateRange;
  setCustomDateRange: React.Dispatch<React.SetStateAction<CustomDateRange>>;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  timeFilter,
  setTimeFilter,
  customDateRange,
  setCustomDateRange,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <FormControl size="small" className="w-44 bg-white">
        <MuiSelect
          value={timeFilter}
          onChange={e => setTimeFilter(e.target.value)}
          displayEmpty
        >
          <MuiMenuItem value="all">All Time</MuiMenuItem>
          <MuiMenuItem value="today">Today</MuiMenuItem>
          <MuiMenuItem value="yesterday">Yesterday</MuiMenuItem>
          <MuiMenuItem value="this_week">This Week</MuiMenuItem>
          <MuiMenuItem value="this_month">This Month</MuiMenuItem>
          <MuiMenuItem value="prev_month">Previous Month</MuiMenuItem>
          <MuiMenuItem value="this_year">This Year</MuiMenuItem>
          <MuiMenuItem value="prev_year">Previous Year</MuiMenuItem>
          <MuiMenuItem value="custom">Custom Range</MuiMenuItem>
        </MuiSelect>
      </FormControl>
      {timeFilter === 'custom' && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={customDateRange.start}
            onChange={e =>
              setCustomDateRange(prev => ({
                ...prev,
                start: e.target.value,
              }))
            }
            size="small"
            className="!w-40 bg-white"
            placeholder="Start Date"
          />
          <span className="text-gray-500">to</span>
          <Input
            type="date"
            value={customDateRange.end}
            onChange={e =>
              setCustomDateRange(prev => ({
                ...prev,
                end: e.target.value,
              }))
            }
            size="small"
            className="!w-40 bg-white"
            placeholder="End Date"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
