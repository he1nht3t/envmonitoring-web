'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAnalyticsStore, TimeRange } from '@/hooks/useAnalyticsStore';
import { cn } from '@/lib/utils';

interface TimeRangePickerProps {
  className?: string;
}

const timeRangeOptions: { value: TimeRange; label: string; description: string }[] = [
  { value: '1h', label: '1 Hour', description: 'Last hour' },
  { value: '6h', label: '6 Hours', description: 'Last 6 hours' },
  { value: '24h', label: '24 Hours', description: 'Today' },
  { value: '7d', label: '7 Days', description: 'Last week' },
  { value: '30d', label: '30 Days', description: 'Last month' },
  { value: 'custom', label: 'Custom', description: 'Custom range' },
];

export default function TimeRangePicker({ className }: TimeRangePickerProps) {
  const {
    selectedTimeRange,
    customStartDate,
    customEndDate,
    setTimeRange,
    setCustomDateRange,
    getDateRangeFromTimeRange
  } = useAnalyticsStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(customStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(customEndDate);
  
  const handleTimeRangeSelect = (range: TimeRange) => {
    setTimeRange(range);
    if (range !== 'custom') {
      setIsOpen(false);
    }
  };
  
  const handleCustomDateApply = () => {
    setCustomDateRange(tempStartDate, tempEndDate);
    setIsOpen(false);
  };
  
  const getCurrentRangeLabel = () => {
    const option = timeRangeOptions.find(opt => opt.value === selectedTimeRange);
    if (selectedTimeRange === 'custom') {
      return `${format(customStartDate, 'MMM d')} - ${format(customEndDate, 'MMM d')}`;
    }
    return option?.label || '24 Hours';
  };
  
  const { start, end } = getDateRangeFromTimeRange();
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-auto min-w-[140px] justify-start text-left font-normal",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {getCurrentRangeLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Time Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  {timeRangeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedTimeRange === option.value ? "default" : "outline"}
                      size="sm"
                      className="justify-start h-auto p-2"
                      onClick={() => handleTimeRangeSelect(option.value)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-xs">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedTimeRange === 'custom' && (
                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-medium text-sm">Custom Range</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Start Date</label>
                      <input
                        type="datetime-local"
                        value={format(tempStartDate, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setTempStartDate(new Date(e.target.value))}
                        className="w-full mt-1 px-3 py-1 text-sm border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">End Date</label>
                      <input
                        type="datetime-local"
                        value={format(tempEndDate, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setTempEndDate(new Date(e.target.value))}
                        className="w-full mt-1 px-3 py-1 text-sm border rounded-md"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCustomDateApply}
                      className="w-full"
                    >
                      Apply Custom Range
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="text-xs text-muted-foreground">
                  <div>Selected Range:</div>
                  <div className="font-medium">
                    {format(start, 'MMM d, yyyy HH:mm')} - {format(end, 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}