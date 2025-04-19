'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDateContext } from '@/context/DateContext';

interface DateSelectorProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function DateSelector({ selectedDate: propSelectedDate, onDateChange: propOnDateChange }: DateSelectorProps) {
  // Use either props or context
  const dateContext = useDateContext();
  
  const selectedDate = propSelectedDate || dateContext.selectedDate;
  const onDateChange = propOnDateChange || dateContext.setSelectedDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Date</CardTitle>
      </CardHeader>
      <CardContent>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
} 