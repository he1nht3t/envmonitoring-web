'use client';

import { Device, SensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useDeviceContext } from '@/context/DeviceContext';

// Dynamically import Leaflet components with no SSR
const MapWithNoSSR = dynamic(
  () => import('./Map'), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        Loading map...
      </div>
    )
  }
);

interface DeviceMapProps {
  devices: Device[];
  sensorData: Record<string, SensorData>;
  focusSelectedDevice?: boolean;
}

export default function DeviceMap({ devices, sensorData, focusSelectedDevice = false }: DeviceMapProps) {
  const { selectedDeviceId } = useDeviceContext();
  
  return (
    <Card className="col-span-2 relative">
      <CardHeader>
        <CardTitle>Device Map</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] relative" style={{ zIndex: 0 }}>
        <MapWithNoSSR 
          devices={devices} 
          sensorData={sensorData} 
          focusSelectedDevice={focusSelectedDevice} 
          selectedDeviceId={selectedDeviceId} 
        />
      </CardContent>
    </Card>
  );
}