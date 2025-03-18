'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { SensorData, fetchSensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeviceSelector from '@/components/DeviceSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { useDeviceContext } from '@/context/DeviceContext';

export default function AnalyticsPage() {
  const { devices, selectedDeviceId, setSelectedDeviceId, loading: devicesLoading } = useDeviceContext();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch sensor data when selected device changes
  useEffect(() => {
    async function loadSensorData() {
      if (!selectedDeviceId) return;
      
      try {
        setLoading(true);
        const data = await fetchSensorData(selectedDeviceId, 100);
        setSensorData(data);
      } catch (error) {
        console.error('Error loading sensor data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadSensorData();
  }, [selectedDeviceId]);
  
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
  
  // Prepare data for charts
  const prepareChartData = () => {
    return sensorData
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(item => ({
        time: format(new Date(item.created_at), 'HH:mm:ss'),
        temperature: item.temperature,
        humidity: item.humidity,
        co: item.co,
        co2: item.co2,
        nh3: item.nh3,
        lpg: item.lpg,
        smoke: item.smoke,
        alcohol: item.alcohol,
        sound_intensity: item.sound_intensity,
        rain_intensity: item.rain_intensity,
        timestamp: new Date(item.created_at).getTime(),
      }));
  };
  
  // Prepare data for pie chart
  const preparePieData = () => {
    const averages = calculateAverages();
    return [
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
  };
  
  const COLORS = ['#f97316', '#3b82f6', '#6b7280', '#ef4444', '#8b5cf6', '#10b981', '#64748b', '#ec4899', '#fbbf24', '#0ea5e9'];

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
        </div>
        <div className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Device selector */}
          <DeviceSelector />
          </div>
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
        </div>
        
        {/* Tabs for different views */}
        <Tabs defaultValue="charts">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature & Humidity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Temperature & Humidity</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature (°C)" />
                      <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* CO & CO2 Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>CO & CO2</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="co" stroke="#ef4444" name="CO (ppm)" />
                      <Line type="monotone" dataKey="co2" stroke="#6b7280" name="CO2 (ppm)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* NH3 & LPG Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>NH3 & LPG</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="nh3" stroke="#8b5cf6" name="NH3 (ppm)" />
                      <Line type="monotone" dataKey="lpg" stroke="#10b981" name="LPG (ppm)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Smoke & Alcohol Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Smoke & Alcohol</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="smoke" stroke="#64748b" name="Smoke (ppm)" />
                      <Line type="monotone" dataKey="alcohol" stroke="#ec4899" name="Alcohol (ppm)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Rain & Sound Intensity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Rain & Sound Intensity</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="rain_intensity" stroke="#0ea5e9" name="Rain Intensity" />
                      <Line type="monotone" dataKey="sound_intensity" stroke="#fbbf24" name="Sound Intensity" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
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
                        labelLine={true}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {preparePieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                      <Legend />
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
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Value (ppm)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}