'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeviceMap from '@/components/DeviceMap';
import { useDeviceContext } from '@/context/DeviceContext';
import { SensorData, fetchLatestSensorData } from '@/lib/supabase';

export default function DevicesPage() {
  const { devices, loading } = useDeviceContext();
  const [latestSensorData, setLatestSensorData] = useState<Record<string, SensorData>>({});
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch latest sensor data on component mount
  useEffect(() => {
    let isSubscribed = true;

    async function loadSensorData() {
      if (!isSubscribed) return;

      try {
        setDataLoading(true);
        
        // Fetch latest sensor data for all devices
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
        console.error('Error loading sensor data:', error);
      } finally {
        if (isSubscribed) {
          setDataLoading(false);
        }
      }
    }
    
    loadSensorData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  if (loading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-xl">Loading devices...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Devices</h1>
        </div>

        {/* Map showing all devices with sensor data */}
        <DeviceMap devices={devices} sensorData={latestSensorData} />

        {/* Devices table */}
        <Card>
          <CardHeader>
            <CardTitle>Device List</CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Latitude</TableHead>
                    <TableHead>Longitude</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.id}</TableCell>
                      <TableCell>{device.lat}</TableCell>
                      <TableCell>{device.long}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <p>No devices found. Please add devices to your Supabase database.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}