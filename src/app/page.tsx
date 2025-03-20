'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DeviceMap from '@/components/DeviceMap';
import { SensorGrid } from '@/components/SensorCard';
import SensorChart from '@/components/SensorChart';
import EnvironmentAnalysis from '@/components/EnvironmentAnalysis';
import DeviceSelector from '@/components/DeviceSelector';
import { SensorData, fetchLatestSensorData, fetchSensorData, subscribeToSensorData } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeviceContext } from '@/context/DeviceContext';

export default function Home() {
  const { devices, selectedDeviceId, loading: devicesLoading } = useDeviceContext();
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
        const latestData = await fetchLatestSensorData();
        
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
  }, [selectedDeviceId]);
  
  // Fetch sensor data when selected device changes
  useEffect(() => {
    async function loadDeviceData() {
      if (!selectedDeviceId) return;
      
      try {
        console.log('Loading sensor data for device:', selectedDeviceId);
        const data = await fetchSensorData(selectedDeviceId, 100);
        console.log('Sensor data loaded:', data.length);
        setDeviceSensorData(data);
      } catch (error) {
        console.error('Error loading device data:', error);
      }
    }
    
    loadDeviceData();
  }, [selectedDeviceId]);
  
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Environmental Monitoring Dashboard</h1>
        </div>
        
        {/* Map showing all devices with focus on selected device */}
        <DeviceMap devices={devices} sensorData={latestSensorData} focusSelectedDevice={true} />
        
        {/* Device selector and current readings */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Device selector */}
            <DeviceSelector />
          </div>
          
          {/* Overview stats for selected device */}
          {selectedDeviceId && latestSensorData[selectedDeviceId] && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{getSelectedDeviceName()} - Current Readings</CardTitle>
                  <CardDescription>
                    Last updated: {new Date(latestSensorData[selectedDeviceId].created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SensorGrid sensorData={latestSensorData[selectedDeviceId]} />
                </CardContent>
              </Card>
              
              {/* Environment Analysis */}
              <EnvironmentAnalysis sensorData={deviceSensorData} deviceName={getSelectedDeviceName()} />
            </div>
          )}
        </div>
        
        {/* Charts section */}
        {!hasRecentData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800">No data from the last 5 minutes is available. Showing all available data instead.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Temperature & Humidity Chart */}
          <SensorChart 
            data={hasRecentData ? recentData : deviceSensorData} 
            title="Temperature & Humidity (Last 5 min)" 
            sensorTypes={[
              { key: 'temperature', color: '#f97316', label: 'Temperature' },
              { key: 'humidity', color: '#3b82f6', label: 'Humidity' }
            ]}
            unit="°C / %" 
          />
          
          {/* CO & CO2 Chart */}
          <SensorChart 
            data={hasRecentData ? recentData : deviceSensorData} 
            title="CO & CO2 (Last 5 min)" 
            sensorTypes={[
              { key: 'co', color: '#ef4444', label: 'CO' },
              { key: 'co2', color: '#6b7280', label: 'CO2' }
            ]}
            unit="ppm" 
          />
          
          {/* NH3 & LPG Chart */}
          <SensorChart 
            data={hasRecentData ? recentData : deviceSensorData} 
            title="NH3 & LPG (Last 5 min)" 
            sensorTypes={[
              { key: 'nh3', color: '#8b5cf6', label: 'NH3' },
              { key: 'lpg', color: '#10b981', label: 'LPG' }
            ]}
            unit="ppm" 
          />
          
          {/* Smoke & Alcohol Chart */}
          <SensorChart 
            data={hasRecentData ? recentData : deviceSensorData} 
            title="Smoke & Alcohol (Last 5 min)" 
            sensorTypes={[
              { key: 'smoke', color: '#64748b', label: 'Smoke' },
              { key: 'alcohol', color: '#ec4899', label: 'Alcohol' }
            ]}
            unit="ppm" 
          />
          
          {/* Rain & Sound Intensity Chart */}
          <SensorChart 
            data={hasRecentData ? recentData : deviceSensorData} 
            title="Rain & Sound Intensity (Last 5 min)" 
            sensorTypes={[
              { key: 'rain_intensity', color: '#0ea5e9', label: 'Rain' },
              { key: 'sound_intensity', color: '#fbbf24', label: 'Sound' }
            ]}
            unit="Intensity" 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
