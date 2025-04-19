'use client';

import { SensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface SensorChartProps {
  data: SensorData[];
  sensorTypes: {
    key: keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>;
    color: string;
    label: string;
    unit?: string;
  }[];
  title: string;
  Ylabel: string;
}

export default function SensorChart({ data, title, sensorTypes, Ylabel }: SensorChartProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(item => ({
        time: format(new Date(item.created_at), 'mm:ss'),
        fullTime: format(new Date(item.created_at), 'HH:mm:ss'),
        timestamp: new Date(item.created_at).getTime(),
        ...sensorTypes.reduce((acc, type) => ({
          ...acc,
          [type.key]: item[type.key as keyof SensorData] != null ? Number(item[type.key as keyof SensorData]) : null
        }), {})
      }));
  }, [data, sensorTypes]);

  // Error boundary and loading state handling
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
            />
            <XAxis 
              dataKey="time" 
              label={{ 
                value: 'Time (mm:ss)', 
                position: 'insideBottomRight', 
                offset: -10,
                fill: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
              }} 
              tickFormatter={(value) => value}
              stroke={isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
              tick={{ fill: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)" }}
            />
            
            {/* Single Y-axis with the provided Ylabel */}
            <YAxis 
              hide={true}
              yAxisId="left"
              label={{ 
                value: Ylabel, 
                angle: -90, 
                position: 'insideLeft',
                offset: 0,
                fill: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
              }}
              stroke={isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
              tick={{ fill: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)" }}
            />
            
            <Tooltip 
              labelFormatter={(value) => {
                const dataEntry = chartData.find(item => item.time === value);
                return `Time: ${dataEntry?.fullTime || value}`;
              }}
              formatter={(value, name) => {
                const sensorType = sensorTypes.find(type => type.key.toString() === name);
                const formattedValue = value != null ? Number(value).toFixed(2) : 'N/A';
                const displayUnit = sensorType?.unit || '';
                return [`${formattedValue} ${displayUnit}`, sensorType?.label || name];
              }}
              contentStyle={{
                backgroundColor: isDarkMode ? '#333' : '#fff',
                borderColor: isDarkMode ? '#555' : '#ccc',
                color: isDarkMode ? '#fff' : '#333'
              }}
            />
            <Legend 
              formatter={(value, entry) => {
                const sensorType = sensorTypes.find(type => type.key.toString() === entry.dataKey);
                return `${sensorType?.label || value}${sensorType?.unit ? ` (${sensorType.unit})` : ''}`;
              }}
              wrapperStyle={{paddingTop: '11px' }}
            />
            
            {/* All lines use the same Y-axis */}
            {sensorTypes.map(sensorType => (
              <Line 
                key={sensorType.key.toString()}
                yAxisId="left"
                type="monotone"
                dot={false}
                dataKey={sensorType.key} 
                stroke={sensorType.color} 
                activeDot={{ r: 3 }} 
                name={sensorType.key.toString()}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}