'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DeviceMap from '@/components/DeviceMap';
import { SensorGrid } from '@/components/SensorCard';
import SensorChart from '@/components/SensorChart';
import EnvironmentAnalysis from '@/components/EnvironmentAnalysis';
import DeviceSelector from '@/components/DeviceSelector';
import DateSelector from '@/components/DateSelector';
import { SensorData, fetchLatestSensorData, fetchSensorData, subscribeToSensorData } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeviceContext } from '@/context/DeviceContext';
import { useDateContext } from '@/context/DateContext';
import { format, isSameDay } from 'date-fns';

export default function Home() {
  const { devices, selectedDeviceId, loading: devicesLoading } = useDeviceContext();
  const { selectedDate } = useDateContext();
  const [latestSensorData, setLatestSensorData] = useState<Record<string, SensorData>>({});
  const [deviceSensorData, setDeviceSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest sensor data and handle real-time updates
  useEffect(() => {
    let isSubscribed = true;
    let subscription: { unsubscribe: () => void } | null = null;

    async function loadInitialData() {
      if (!isSubscribed) return;

      try {
        setLoading(true);
        const latestData = await fetchLatestSensorData(selectedDate);
        
        if (!isSubscribed) return;

        // Convert array to record with device_id as key
        const latestByDevice = latestData.reduce((acc, item) => {
          acc[item.device_id] = item;
          return acc;
        }, {} as Record<string, SensorData>);
        
        setLatestSensorData(latestByDevice);
      } catch (error) {
        if (!isSubscribed) return;
        console.error('Error loading initial data:', error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }
    
    async function setupRealtimeSubscription() {
      if (!isSubscribed) return;

      subscription = subscribeToSensorData((payload) => {
        if (!isSubscribed) return;

        const newReading = payload.new as SensorData;
        
        // Only include readings from the selected date
        if (isSameDay(new Date(newReading.created_at), selectedDate)) {
          setLatestSensorData(prev => ({
            ...prev,
            [newReading.device_id]: newReading
          }));
          
          if (newReading.device_id === selectedDeviceId) {
            setDeviceSensorData(prev => {
              const updatedData = [newReading, ...prev];
              // Keep only the last 100 readings to prevent memory issues
              return updatedData.slice(0, 100);
            });
          }
        }
      });
    }
    
    loadInitialData();
    setupRealtimeSubscription();
    
    return () => {
      isSubscribed = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [selectedDeviceId, selectedDate]);
  
  // Fetch sensor data when selected device or date changes
  useEffect(() => {
    async function loadDeviceData() {
      if (!selectedDeviceId) return;
      
      try {
        console.log('Loading sensor data for device:', selectedDeviceId, 'date:', format(selectedDate, 'yyyy-MM-dd'));
        const data = await fetchSensorData(selectedDeviceId, 100, selectedDate);
        console.log('Sensor data loaded:', data.length);
        setDeviceSensorData(data);
      } catch (error) {
        console.error('Error loading device data:', error);
      }
    }
    
    loadDeviceData();
  }, [selectedDeviceId, selectedDate]);
  
  // Get the selected device name
  const getSelectedDeviceName = () => {
    const device = devices.find(d => d.id === selectedDeviceId);
    return device ? device.name : 'Unknown Device';
  };

  // Filter data to show only the last 5 minutes
  const getRecentData = () => {
    if (!deviceSensorData.length) return [];
    
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    return deviceSensorData.filter(reading => 
      new Date(reading.created_at) >= fiveMinutesAgo
    );
  };

  if (loading || devicesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-xl">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Get recent data for charts
  const recentData = getRecentData();
  const hasRecentData = recentData.length > 0;
  
  // Format date for display
  const formattedDate = format(selectedDate, 'MMMM d, yyyy');
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Environmental Monitoring Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Viewing data for: <span className="font-medium">{formattedDate}</span> {isToday && <span className="ml-1 text-green-500">(Today)</span>}
          </div>
        </div>
        
        {/* Map showing all devices with focus on selected device */}
        <DeviceMap devices={devices} sensorData={latestSensorData} focusSelectedDevice={true} />
        
        {/* Device selector and current readings */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Device selector */}
            <DeviceSelector />
            
            {/* Date selector */}
            <DateSelector />
          </div>
          
          {/* Overview stats for selected device */}
          {selectedDeviceId && latestSensorData[selectedDeviceId] && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{getSelectedDeviceName()} - {isToday ? 'Current' : 'Latest'} Readings</CardTitle>
                  <CardDescription>
                    {latestSensorData[selectedDeviceId] ? (
                      <>Last updated: {new Date(latestSensorData[selectedDeviceId].created_at).toLocaleString()}</>
                    ) : (
                      <>No data available for {formattedDate}</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {latestSensorData[selectedDeviceId] ? (
                    <SensorGrid sensorData={latestSensorData[selectedDeviceId]} />
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No sensor data available for this date
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Environment Analysis */}
              {deviceSensorData.length > 0 && (
                <EnvironmentAnalysis sensorData={deviceSensorData} deviceName={getSelectedDeviceName()} />
              )}
            </div>
          )}
        </div>
        
        {/* Charts section */}
        {deviceSensorData.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800">No data available for {formattedDate}.</p>
          </div>
        ) : (!hasRecentData && isToday) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800">No data from the last 5 minutes is available. Showing all data for {formattedDate}.</p>
          </div>
        )}
        
        {deviceSensorData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temperature & Humidity Chart */}
            <SensorChart 
              data={isToday && hasRecentData ? recentData : deviceSensorData} 
              title={`Temperature & Humidity ${isToday && hasRecentData ? '(Last 5 min)' : `(${formattedDate})`}`} 
              sensorTypes={[
                { key: 'temperature', color: '#f97316', label: 'Temperature', unit: '°C' },
                { key: 'humidity', color: '#3b82f6', label: 'Humidity', unit: '%' }
              ]}
              Ylabel="°C / %" 
            />
            
            {/* CO & CO2 Chart */}
            <SensorChart 
              data={isToday && hasRecentData ? recentData : deviceSensorData} 
              title={`CO & CO2 ${isToday && hasRecentData ? '(Last 5 min)' : `(${formattedDate})`}`} 
              sensorTypes={[
                { key: 'co', color: '#ef4444', label: 'CO', unit: 'ppm' },
                { key: 'co2', color: '#6b7280', label: 'CO2', unit: 'ppm' }
              ]}
              Ylabel="ppm" 
            />
            
            {/* NH3 & LPG Chart */}
            <SensorChart 
              data={isToday && hasRecentData ? recentData : deviceSensorData} 
              title={`NH3 & LPG ${isToday && hasRecentData ? '(Last 5 min)' : `(${formattedDate})`}`} 
              sensorTypes={[
                { key: 'nh3', color: '#8b5cf6', label: 'NH3', unit: 'ppm' },
                { key: 'lpg', color: '#10b981', label: 'LPG', unit: 'ppm' }
              ]}
              Ylabel="ppm" 
            />
            
            {/* Smoke & Alcohol Chart */}
            <SensorChart 
              data={isToday && hasRecentData ? recentData : deviceSensorData} 
              title={`Smoke & Alcohol ${isToday && hasRecentData ? '(Last 5 min)' : `(${formattedDate})`}`} 
              sensorTypes={[
                { key: 'smoke', color: '#64748b', label: 'Smoke', unit: 'ppm' },
                { key: 'alcohol', color: '#ec4899', label: 'Alcohol', unit: 'ppm' }
              ]}
              Ylabel="ppm" 
            />
            
            {/* Rain & Sound Intensity Chart */}
            <SensorChart 
              data={isToday && hasRecentData ? recentData : deviceSensorData} 
              title={`Rain & Sound Intensity ${isToday && hasRecentData ? '(Last 5 min)' : `(${formattedDate})`}`} 
              sensorTypes={[
                { key: 'rain_intensity', color: '#0ea5e9', label: 'Rain', unit: 'mm/h' },
                { key: 'sound_intensity', color: '#fbbf24', label: 'Sound', unit: 'dB' }
              ]}
              Ylabel="mm/h / dB" 
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
