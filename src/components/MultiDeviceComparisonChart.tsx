'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SensorData, fetchSensorData } from '@/lib/supabase';
import { useDeviceContext } from '@/context/DeviceContext';
import { useDateContext } from '@/context/DateContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { ChartSkeleton } from '@/components/ui/skeleton';

interface MultiDeviceComparisonChartProps {
  selectedDeviceIds: string[];
  sensorType: keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>;
  title: string;
  unit?: string;
}

// Color palette for different devices
const DEVICE_COLORS = [
  '#8884d8', // Blue
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7c7c', // Red
  '#8dd1e1', // Light Blue
  '#d084d0', // Purple
  '#ffb347', // Orange
  '#87ceeb'  // Sky Blue
];

export default function MultiDeviceComparisonChart({
  selectedDeviceIds,
  sensorType,
  title,
  unit = ''
}: MultiDeviceComparisonChartProps) {
  const { devices } = useDeviceContext();
  const { selectedDate } = useDateContext();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [deviceData, setDeviceData] = useState<Record<string, SensorData[]>>({});
  const [loading, setLoading] = useState(false);

  // Fetch data for all selected devices
  useEffect(() => {
    async function loadMultiDeviceData() {
      if (selectedDeviceIds.length === 0) {
        setDeviceData({});
        return;
      }

      try {
        setLoading(true);
        const dataPromises = selectedDeviceIds.map(async (deviceId) => {
          const data = await fetchSensorData(deviceId, 50, selectedDate);
          return { deviceId, data };
        });

        const results = await Promise.all(dataPromises);
        const newDeviceData: Record<string, SensorData[]> = {};
        
        results.forEach(({ deviceId, data }) => {
          newDeviceData[deviceId] = data;
        });

        setDeviceData(newDeviceData);
      } catch (error) {
        console.error('Error loading multi-device data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMultiDeviceData();
  }, [selectedDeviceIds, selectedDate]);

  // Prepare chart data by merging all device data by timestamp
  const chartData = useMemo(() => {
    if (Object.keys(deviceData).length === 0) return [];

    // Get all unique timestamps from all devices
    const allTimestamps = new Set<number>();
    Object.values(deviceData).forEach(data => {
      data.forEach(item => {
        allTimestamps.add(new Date(item.created_at).getTime());
      });
    });

    // Sort timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort();

    // Create chart data points
    return sortedTimestamps.map(timestamp => {
      const dataPoint: { [key: string]: number | string } = {
        timestamp,
        time: format(new Date(timestamp), 'HH:mm:ss'),
        fullTime: format(new Date(timestamp), 'MMM d, HH:mm:ss')
      };

      // Add data for each device at this timestamp (or closest)
      selectedDeviceIds.forEach(deviceId => {
        const deviceSensorData = deviceData[deviceId] || [];
        const deviceName = devices.find(d => d.id === deviceId)?.name || `Device ${deviceId.slice(0, 8)}`;
        
        // Find the closest data point for this timestamp
        const closestData = deviceSensorData.reduce((closest, current) => {
          const currentTime = new Date(current.created_at).getTime();
          const closestTime = new Date(closest.created_at).getTime();
          
          return Math.abs(currentTime - timestamp) < Math.abs(closestTime - timestamp)
            ? current
            : closest;
        }, deviceSensorData[0]);

        if (closestData && Math.abs(new Date(closestData.created_at).getTime() - timestamp) < 300000) { // 5 minutes tolerance
          dataPoint[deviceName] = closestData[sensorType];
        }
      });

      return dataPoint;
    }).filter(point => {
      // Only include points that have data for at least one device
      return selectedDeviceIds.some(deviceId => {
        const deviceName = devices.find(d => d.id === deviceId)?.name || `Device ${deviceId.slice(0, 8)}`;
        return point[deviceName] !== undefined;
      });
    });
  }, [deviceData, selectedDeviceIds, devices, sensorType]);

  // Get device names for legend
  const getDeviceName = (deviceId: string) => {
    return devices.find(d => d.id === deviceId)?.name || `Device ${deviceId.slice(0, 8)}`;
  };

  if (selectedDeviceIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Select devices to compare their {sensorType} data</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            Comparing {selectedDeviceIds.length} device{selectedDeviceIds.length > 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
              />
              <XAxis 
                dataKey="time"
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
                label={{ 
                  value: `${sensorType} ${unit}`, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px'
                }}
                labelFormatter={(value) => {
                  const point = chartData.find(p => p.time === value);
                  return point ? (point.fullTime as string) : String(value);
                }}
                formatter={(value: number, name: string) => [
                  `${value}${unit}`,
                  name
                ]}
              />
              <Legend />
              {selectedDeviceIds.map((deviceId, index) => {
                const deviceName = getDeviceName(deviceId);
                return (
                  <Line
                    key={deviceId}
                    type="monotone"
                    dataKey={deviceName}
                    stroke={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                    name={deviceName}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}