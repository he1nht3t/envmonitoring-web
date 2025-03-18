'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeviceContext } from '@/context/DeviceContext';

export default function DeviceSelector() {
  const { devices, selectedDeviceId, setSelectedDeviceId } = useDeviceContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Device</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a device" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                {device.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}