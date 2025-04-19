'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { SensorData, fetchSensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeviceSelector from '@/components/DeviceSelector';
import SensorTable from '@/components/SensorTable';
import SensorChart from '@/components/SensorChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { format, isSameDay } from 'date-fns';
import { useDeviceContext } from '@/context/DeviceContext';
import { useDateContext } from '@/context/DateContext';
import { useTheme } from '@/context/ThemeContext';
import DateSelector from '@/components/DateSelector';

// Define the type for sensor chart key
type SensorKey = keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>;

export default function AnalyticsPage() {
  const { devices, selectedDeviceId, loading: devicesLoading } = useDeviceContext();
  const { selectedDate } = useDateContext();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Fetch sensor data when selected device or date changes
  useEffect(() => {
    async function loadSensorData() {
      if (!selectedDeviceId) return;
      
      try {
        setLoading(true);
        const data = await fetchSensorData(selectedDeviceId, 100, selectedDate);
        setSensorData(data);
      } catch (error) {
        console.error('Error loading sensor data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadSensorData();
  }, [selectedDeviceId, selectedDate]);
  
  // Get the selected device name
  const getSelectedDeviceName = () => {
    const device = devices.find(d => d.id === selectedDeviceId);
    return device ? device.name : 'Unknown Device';
  };
  
  // Calculate average values for each sensor type
  const calculateAverages = () => {
    if (sensorData.length === 0) return {};
    
    const sum = sensorData.reduce((acc, item) => {
      Object.keys(item).forEach(key => {
        if (typeof item[key as keyof SensorData] === 'number') {
          acc[key] = (acc[key] || 0) + Number(item[key as keyof SensorData]);
        }
      });
      return acc;
    }, {} as Record<string, number>);
    
    const averages = {} as Record<string, number>;
    Object.keys(sum).forEach(key => {
      averages[key] = sum[key] / sensorData.length;
    });
    
    return averages;
  };
  
  // Prepare and normalize pie chart data with proper scaling
  const preparePieData = () => {
    const averages = calculateAverages();
    const data = [
      { name: 'Temperature', value: averages.temperature || 0 },
      { name: 'Humidity', value: averages.humidity || 0 },
      { name: 'CO2', value: averages.co2 || 0 },
      { name: 'CO', value: averages.co || 0 },
      { name: 'NH3', value: averages.nh3 || 0 },
      { name: 'LPG', value: averages.lpg || 0 },
      { name: 'Smoke', value: averages.smoke || 0 },
      { name: 'Alcohol', value: averages.alcohol || 0 },
      { name: 'Sound', value: averages.sound_intensity || 0 },
      { name: 'Rain', value: averages.rain_intensity || 0 },
    ];

    // Normalize values to prevent overlapping text
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      value: total === 0 ? 0 : (item.value / total) * 100
    }));
  };
  
  // Define chart colors with dark mode support
  const getChartColors = () => {
    return isDarkMode 
      ? ['#8b5cf6', '#3b82f6', '#a8a29e', '#ef4444', '#8b5cf6', '#10b981', '#64748b', '#ec4899', '#fbbf24', '#0ea5e9']
      : ['#f97316', '#3b82f6', '#6b7280', '#ef4444', '#8b5cf6', '#10b981', '#64748b', '#ec4899', '#fbbf24', '#0ea5e9'];
  };
  
  const COLORS = getChartColors();

  // Define sensor type configurations for the charts
  const tempHumiditySensors = [
    { key: 'temperature' as SensorKey, color: '#f97316', label: 'Temperature', unit: '°C' },
    { key: 'humidity' as SensorKey, color: '#3b82f6', label: 'Humidity', unit: '%' }
  ];

  const coSensors = [
    { key: 'co' as SensorKey, color: '#ef4444', label: 'CO', unit: 'ppm' },
    { key: 'co2' as SensorKey, color: '#6b7280', label: 'CO2', unit: 'ppm' }
  ];

  const gasSensors = [
    { key: 'nh3' as SensorKey, color: '#8b5cf6', label: 'NH3', unit: 'ppm' },
    { key: 'lpg' as SensorKey, color: '#10b981', label: 'LPG', unit: 'ppm' }
  ];

  const smokeSensors = [
    { key: 'smoke' as SensorKey, color: '#64748b', label: 'Smoke', unit: 'ppm' },
    { key: 'alcohol' as SensorKey, color: '#ec4899', label: 'Alcohol', unit: 'ppm' }
  ];

  const environmentalSensors = [
    { key: 'rain_intensity' as SensorKey, color: '#0ea5e9', label: 'Rain', unit: 'mm/H' },
    { key: 'sound_intensity' as SensorKey, color: '#fbbf24', label: 'Sound', unit: 'dB' }
  ];

  // Add error boundary and loading state handling
  if (loading || devicesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-xl">Loading analytics data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div className="text-sm text-muted-foreground">
            Viewing data for: <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span> 
            {isSameDay(selectedDate, new Date()) && <span className="ml-1 text-green-500">(Today)</span>}
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Device selector */}
            <DeviceSelector />
            
            {/* Date selector */}
            <DateSelector />
          </div>
          
          {sensorData.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No data available</h3>
                  <p className="text-muted-foreground">
                    There is no sensor data available for {format(selectedDate, 'MMMM d, yyyy')}.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Analytics overview */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>{getSelectedDeviceName()} - Analytics Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(calculateAverages()).map(([key, value]) => (
                      <Card key={key}>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium">{key.replace('_', ' ').toUpperCase()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{value.toFixed(2)}</div>
                          <p className="text-xs text-muted-foreground">Average value</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            
              {/* Tabs for different views */}
              <Tabs defaultValue="charts">
                <TabsList>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="distribution">Distribution</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                
                <TabsContent value="charts">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Temperature & Humidity Chart */}
                    <SensorChart 
                      data={sensorData} 
                      sensorTypes={tempHumiditySensors} 
                      title="Temperature & Humidity" 
                      Ylabel="°C / %"
                    />
                    
                    {/* CO & CO2 Chart */}
                    <SensorChart 
                      data={sensorData} 
                      sensorTypes={coSensors} 
                      title="CO & CO2" 
                      Ylabel="ppm"
                    />
                    
                    {/* NH3 & LPG Chart */}
                    <SensorChart 
                      data={sensorData} 
                      sensorTypes={gasSensors} 
                      title="NH3 & LPG" 
                      Ylabel="ppm"
                    />
                    
                    {/* Smoke & Alcohol Chart */}
                    <SensorChart 
                      data={sensorData} 
                      sensorTypes={smokeSensors} 
                      title="Smoke & Alcohol" 
                      Ylabel="ppm"
                    />
                    
                    {/* Rain & Sound Intensity Chart */}
                    <SensorChart 
                      data={sensorData} 
                      sensorTypes={environmentalSensors} 
                      title="Rain & Sound Intensity" 
                      Ylabel="mm/h / dB"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="distribution">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sensor Data Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={preparePieData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {preparePieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#333' : '#fff',
                                borderColor: isDarkMode ? '#555' : '#ccc',
                                color: isDarkMode ? '#fff' : '#333'
                              }}
                            />
                            <Legend wrapperStyle={{ color: isDarkMode ? '#fff' : '#000' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Air Quality Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={[
                              { name: 'CO', value: calculateAverages().co || 0 },
                              { name: 'CO2', value: calculateAverages().co2 || 0 },
                              { name: 'NH3', value: calculateAverages().nh3 || 0 },
                              { name: 'LPG', value: calculateAverages().lpg || 0 },
                              { name: 'Smoke', value: calculateAverages().smoke || 0 },
                              { name: 'Alcohol', value: calculateAverages().alcohol || 0 },
                            ]}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke={isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                            />
                            <XAxis 
                              type="number" 
                              stroke={isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
                              tick={{ fill: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)" }}
                            />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              stroke={isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
                              tick={{ fill: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)" }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#333' : '#fff',
                                borderColor: isDarkMode ? '#555' : '#ccc',
                                color: isDarkMode ? '#fff' : '#333'
                              }}
                            />
                            <Legend wrapperStyle={{ color: isDarkMode ? '#fff' : '#000' }} />
                            <Bar dataKey="value" fill={isDarkMode ? "#8b5cf6" : "#8884d8"} name="Value (ppm)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="table">
                  <SensorTable 
                    data={sensorData} 
                    deviceName={getSelectedDeviceName()} 
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}