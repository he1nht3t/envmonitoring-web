'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { SensorData, fetchAllSensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeviceSelector from '@/components/DeviceSelector';
import SensorTable from '@/components/SensorTable';
import SensorChart from '@/components/SensorChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { LoadingOverlay } from '@/components/ui/spinner';
import { TrendingUp, BarChart3, Database, Calendar, AlertCircle } from 'lucide-react';
import MultiDeviceSelector from '@/components/MultiDeviceSelector';
import MultiDeviceComparisonChart from '@/components/MultiDeviceComparisonChart';
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
import { format } from 'date-fns';
import { useDeviceContext } from '@/context/DeviceContext';
import { useDateContext } from '@/context/DateContext';
import { useTheme } from '@/context/ThemeContext';
import DateSelector from '@/components/DateSelector';
import TimeRangePicker from '@/components/TimeRangePicker';
import HealthRiskIndicator from '@/components/HealthRiskIndicator';
import StatisticalSummary from '@/components/StatisticalSummary';
import TrendAnalysisChart from '@/components/TrendAnalysisChart';
import { useAnalyticsStore } from '@/hooks/useAnalyticsStore';

// Define the type for sensor chart key
type SensorKey = keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>;

export default function AnalyticsPage() {
  const { devices, selectedDeviceId, loading: devicesLoading } = useDeviceContext();
  const { selectedDate } = useDateContext();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { selectedTimeRange, customStartDate, customEndDate, getDateRangeFromTimeRange } = useAnalyticsStore();
  
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDevicesForComparison, setSelectedDevicesForComparison] = useState<string[]>(selectedDeviceId ? [selectedDeviceId] : []);

  // Fetch sensor data when selected device or date changes
  useEffect(() => {
    async function loadSensorData() {
      if (!selectedDeviceId) return;
      
      try {
        setLoading(true);
        const { start, end } = getDateRangeFromTimeRange(selectedDate);
      const data = await fetchAllSensorData(selectedDeviceId, start, end);
        setSensorData(data);
      } catch (error) {
        console.error('Error loading sensor data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadSensorData();
  }, [selectedDeviceId, selectedDate, selectedTimeRange, customStartDate, customEndDate, getDateRangeFromTimeRange]);
  
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
  if (devicesLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="py-2">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <DeviceSelector />
              <TimeRangePicker />
              <DateSelector />
            </div>
          </div>
          
          <div className="space-y-4">
          
          {sensorData.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="py-12">
                  <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Database className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    
                    {/* Title */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        No Data Available
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No sensor data found for the selected criteria
                      </p>
                    </div>
                    
                    {/* Date info */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
                      </div>
                      
                      {selectedDeviceId && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <Database className="w-4 h-4" />
                          <span>Device: {getSelectedDeviceName()}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Suggestions */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                          <p className="font-medium mb-1">Try the following:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Select a different date</li>
                            <li>• Choose another device</li>
                            <li>• Check if the device was active on this date</li>
                            <li>• Verify your time range settings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Health Risk Indicator and Statistical Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <HealthRiskIndicator sensorData={sensorData} />
                <StatisticalSummary sensorData={sensorData} />
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
            
              {/* Tabs for different views */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto scrollbar-hide mobile-scroll px-1">
                  <TabsList className="inline-flex gap-2 min-w-max">
                  <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
                  <TabsTrigger value="trends" className="whitespace-nowrap">Trends</TabsTrigger>
                  <TabsTrigger value="charts" className="whitespace-nowrap">Charts</TabsTrigger>
                  <TabsTrigger value="comparison" className="whitespace-nowrap">Compare</TabsTrigger>
                  <TabsTrigger value="distribution" className="whitespace-nowrap">Distribution</TabsTrigger>
                  <TabsTrigger value="table" className="whitespace-nowrap">Table</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Stats Cards */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Quick Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {sensorData.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Data Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {calculateAverages().temperature.toFixed(1)}°C
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Temperature</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {calculateAverages().humidity.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Humidity</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {calculateAverages().co.toFixed(1)} ppm
                            </div>
                            <div className="text-sm text-muted-foreground">Avg CO</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Recent Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Recent Trends
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries({
                            Temperature: { value: calculateAverages().temperature, unit: '°C', trend: 'stable' },
                            Humidity: { value: calculateAverages().humidity, unit: '%', trend: 'increasing' },
                            'CO Level': { value: calculateAverages().co, unit: 'ppm', trend: 'decreasing' },
                            'Air Quality': { value: calculateAverages().co2, unit: 'ppm', trend: 'stable' }
                          }).map(([key, data]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{key}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{data.value.toFixed(1)} {data.unit}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  data.trend === 'increasing' ? 'bg-green-100 text-green-700' :
                                  data.trend === 'decreasing' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {data.trend === 'increasing' ? '↗' : data.trend === 'decreasing' ? '↘' : '→'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="trends" className="space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <TrendAnalysisChart
                      sensorData={sensorData}
                      sensorKey="temperature"
                      title="Temperature"
                      unit="°C"
                    />
                    <TrendAnalysisChart
                      sensorData={sensorData}
                      sensorKey="humidity"
                      title="Humidity"
                      unit="%"
                    />
                    <TrendAnalysisChart
                      sensorData={sensorData}
                      sensorKey="co"
                      title="Carbon Monoxide"
                      unit="ppm"
                    />
                    <TrendAnalysisChart
                      sensorData={sensorData}
                      sensorKey="co2"
                      title="Carbon Dioxide"
                      unit="ppm"
                    />
                    <TrendAnalysisChart
                      sensorData={sensorData}
                      sensorKey="nh3"
                      title="Ammonia"
                      unit="ppm"
                    />
                    <TrendAnalysisChart
                      sensorData={sensorData}
                      sensorKey="lpg"
                      title="LPG"
                      unit="ppm"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="charts">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ChartSkeleton />
                      <ChartSkeleton />
                      <ChartSkeleton />
                      <ChartSkeleton />
                      <ChartSkeleton />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Temperature & Humidity Chart */}
                      <LoadingOverlay isLoading={loading}>
                        <SensorChart 
                          data={sensorData} 
                          sensorTypes={tempHumiditySensors} 
                          title="Temperature & Humidity" 
                          Ylabel="°C / %"
                        />
                      </LoadingOverlay>
                      
                      {/* CO & CO2 Chart */}
                      <LoadingOverlay isLoading={loading}>
                        <SensorChart 
                          data={sensorData} 
                          sensorTypes={coSensors} 
                          title="CO & CO2" 
                          Ylabel="ppm"
                        />
                      </LoadingOverlay>
                      
                      {/* NH3 & LPG Chart */}
                      <LoadingOverlay isLoading={loading}>
                        <SensorChart 
                          data={sensorData} 
                          sensorTypes={gasSensors} 
                          title="NH3 & LPG" 
                          Ylabel="ppm"
                        />
                      </LoadingOverlay>
                      
                      {/* Smoke & Alcohol Chart */}
                      <LoadingOverlay isLoading={loading}>
                        <SensorChart 
                          data={sensorData} 
                          sensorTypes={smokeSensors} 
                          title="Smoke & Alcohol" 
                          Ylabel="ppm"
                        />
                      </LoadingOverlay>
                      
                      {/* Rain & Sound Intensity Chart */}
                      <LoadingOverlay isLoading={loading}>
                        <SensorChart 
                          data={sensorData} 
                          sensorTypes={environmentalSensors} 
                          title="Rain & Sound Intensity" 
                          Ylabel="mm/h / dB"
                        />
                      </LoadingOverlay>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="comparison" className="space-y-4">
                  <div className="space-y-4">
                    {/* Multi-device selector */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Devices to Compare</CardTitle>
                      </CardHeader>
                      <CardContent>
                  <MultiDeviceSelector 
                    selectedDeviceIds={selectedDevicesForComparison}
                    onSelectionChange={setSelectedDevicesForComparison}
                  />
                      </CardContent>
                    </Card>
                    
                    {/* Comparison charts */}
                    {selectedDevicesForComparison.length > 0 && (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <MultiDeviceComparisonChart
                          selectedDeviceIds={selectedDevicesForComparison}
                          sensorType="temperature"
                          title="Temperature Comparison"
                          unit="°C"
                        />
                        <MultiDeviceComparisonChart
                          selectedDeviceIds={selectedDevicesForComparison}
                          sensorType="humidity"
                          title="Humidity Comparison"
                          unit="%"
                        />
                        <MultiDeviceComparisonChart
                          selectedDeviceIds={selectedDevicesForComparison}
                          sensorType="co"
                          title="Carbon Monoxide Comparison"
                          unit=" ppm"
                        />
                        <MultiDeviceComparisonChart
                          selectedDeviceIds={selectedDevicesForComparison}
                          sensorType="co2"
                          title="Carbon Dioxide Comparison"
                          unit=" ppm"
                        />
                        <MultiDeviceComparisonChart
                          selectedDeviceIds={selectedDevicesForComparison}
                          sensorType="nh3"
                          title="Ammonia Comparison"
                          unit=" ppm"
                        />
                        <MultiDeviceComparisonChart
                          selectedDeviceIds={selectedDevicesForComparison}
                          sensorType="lpg"
                          title="LPG Comparison"
                          unit=" ppm"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="distribution">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ChartSkeleton className="h-[400px]" />
                      <ChartSkeleton className="h-[400px]" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <LoadingOverlay isLoading={loading}>
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
                      </LoadingOverlay>
                      
                      <LoadingOverlay isLoading={loading}>
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
                      </LoadingOverlay>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="table">
                  {loading ? (
                    <Card>
                      <CardHeader>
                        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      </CardHeader>
                      <CardContent>
                        <TableSkeleton rows={10} cols={11} />
                      </CardContent>
                    </Card>
                  ) : (
                    <LoadingOverlay isLoading={loading}>
                      <SensorTable 
                        data={sensorData} 
                        deviceName={getSelectedDeviceName()} 
                      />
                    </LoadingOverlay>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}