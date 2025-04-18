'use client';

import { useState } from 'react';
import { SensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface SensorTableProps {
  data: SensorData[];
  deviceName: string;
}

export default function SensorTable({ data, deviceName }: SensorTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sort data by created_at in descending order (newest first)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Calculate pagination values
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentPageData = sortedData.slice(startIndex, endIndex);
  
  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

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
          <Button variant="outline" onClick={downloadCSV} className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <Download className="h-4 w-4 mr-2" />
            <span>Download CSV</span>
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
              currentPageData.map((reading) => (
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
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination controls */}
        {sortedData.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {endIndex} of {totalItems} entries
              </p>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">per page</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center">
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}