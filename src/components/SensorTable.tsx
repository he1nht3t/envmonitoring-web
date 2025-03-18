'use client';

import { useState } from 'react';
import { SensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';

import { DateRange } from 'react-day-picker';

interface SensorTableProps {
  data: SensorData[];
  deviceName: string;
}

export default function SensorTable({ data, deviceName }: SensorTableProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Filter data by date range
  const filteredData = data.filter(reading => {
    const readingDate = new Date(reading.created_at);
    
    if (dateRange?.from && dateRange?.to) {
      return isAfter(readingDate, startOfDay(dateRange.from)) && 
             isBefore(readingDate, endOfDay(dateRange.to));
    }
    
    if (dateRange?.from && !dateRange?.to) {
      return isAfter(readingDate, startOfDay(dateRange.from));
    }
    
    if (!dateRange?.from && dateRange?.to) {
      return isBefore(readingDate, endOfDay(dateRange.to));
    }
    
    return true;
  });

  // Sort data by created_at in descending order (newest first)
  const sortedData = [...filteredData].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Function to download data as CSV
  const downloadCSV = () => {
    // CSV header
    const headers = [
      'Time', 'Temperature (°C)', 'Humidity (%)', 'CO (ppm)', 'CO2 (ppm)', 
      'NH3 (ppm)', 'LPG (ppm)', 'Smoke (ppm)', 'Alcohol (ppm)', 
      'Sound (dB)', 'Rain'
    ];
    
    // Format data rows
    const rows = sortedData.map(reading => [
      format(new Date(reading.created_at), 'yyyy-MM-dd HH:mm:ss'),
      reading.temperature.toFixed(1),
      reading.humidity.toFixed(1),
      reading.co.toFixed(1),
      reading.co2.toFixed(1),
      reading.nh3.toFixed(1),
      reading.lpg.toFixed(1),
      reading.smoke.toFixed(1),
      reading.alcohol.toFixed(1),
      reading.sound_intensity.toFixed(1),
      reading.rain_intensity.toFixed(1)
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up download
    const fileName = `${deviceName.replace(/\s+/g, '_')}_sensor_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <CardTitle>Recent Readings: {deviceName}</CardTitle>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      'Filter by date'
                    )}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" onClick={downloadCSV} className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </div>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Temp (°C)</TableHead>
              <TableHead>Humidity (%)</TableHead>
              <TableHead>CO (ppm)</TableHead>
              <TableHead>CO2 (ppm)</TableHead>
              <TableHead>NH3 (ppm)</TableHead>
              <TableHead>LPG (ppm)</TableHead>
              <TableHead>Smoke (ppm)</TableHead>
              <TableHead>Alcohol (ppm)</TableHead>
              <TableHead>Sound (dB)</TableHead>
              <TableHead>Rain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.slice(0, 10).map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>{format(new Date(reading.created_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                  <TableCell>{reading.temperature.toFixed(1)}</TableCell>
                  <TableCell>{reading.humidity.toFixed(1)}</TableCell>
                  <TableCell>{reading.co.toFixed(1)}</TableCell>
                  <TableCell>{reading.co2.toFixed(1)}</TableCell>
                  <TableCell>{reading.nh3.toFixed(1)}</TableCell>
                  <TableCell>{reading.lpg.toFixed(1)}</TableCell>
                  <TableCell>{reading.smoke.toFixed(1)}</TableCell>
                  <TableCell>{reading.alcohol.toFixed(1)}</TableCell>
                  <TableCell>{reading.sound_intensity.toFixed(1)}</TableCell>
                  <TableCell>{reading.rain_intensity.toFixed(1)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  No data available for the selected date range
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}