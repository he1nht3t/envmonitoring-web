'use client';

import { SensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface SensorChartProps {
  data: SensorData[];
  sensorTypes: {
    key: keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>;
    color: string;
    label: string;
  }[];
  title: string;
  unit: string;
}

export default function SensorChart({ data, title, sensorTypes, unit }: SensorChartProps) {
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
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (mm:ss)', position: 'insideBottomRight', offset: -10 }} 
              tickFormatter={(value) => value}
            />
            <YAxis 
              label={{ value: unit, angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              labelFormatter={(value) => {
                const dataEntry = chartData.find(item => item.time === value);
                return `Time: ${dataEntry?.fullTime || value}`;
              }}
              formatter={(value, name) => {
                const sensorType = sensorTypes.find(type => type.key === name);
                const formattedValue = value != null ? (value === 0 ? '0' : (Number(value) < 0.01 ? Number(value).toExponential(2) : Number(value).toFixed(2))) : 'N/A';
                return [`${formattedValue} ${unit}`, sensorType?.label || name];
              }}
            />
            <Legend />
            {sensorTypes.map(sensorType => (
              <Line 
                key={sensorType.key.toString()}
                type="monotone" 
                dataKey={sensorType.key} 
                stroke={sensorType.color} 
                activeDot={{ r: 8 }} 
                name={sensorType.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}