'use client';

import { SensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

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

export default function SensorChart({ data, sensorTypes, title, unit }: SensorChartProps) {
  // Sort data by created_at in ascending order
  const sortedData = [...data].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Format data for the chart
  const chartData = sortedData.map(item => {
    const formattedItem: any = {
      time: format(new Date(item.created_at), 'mm:ss'),
      fullTime: format(new Date(item.created_at), 'HH:mm:ss'),
      timestamp: new Date(item.created_at).getTime(),
    };
    
    // Add each sensor type to the formatted item
    sensorTypes.forEach(sensorType => {
      formattedItem[sensorType.key] = item[sensorType.key];
    });
    
    return formattedItem;
  });

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
              labelFormatter={(value, entry) => {
                const dataEntry = chartData.find(item => item.time === value);
                return `Time: ${dataEntry?.fullTime || value}`;
              }}
              formatter={(value, name, props) => {
                const sensorType = sensorTypes.find(type => type.key === name);
                return [`${value} ${unit}`, sensorType?.label || name];
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