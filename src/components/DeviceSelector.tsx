'use client';


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeviceContext } from '@/context/DeviceContext';

export default function DeviceSelector() {
  const { devices, selectedDeviceId, setSelectedDeviceId } = useDeviceContext();

  return (
    <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
      <SelectTrigger className="w-auto min-w-[160px]">
        <SelectValue placeholder="Select device" />
      </SelectTrigger>
      <SelectContent>
        {devices.map((device) => (
          <SelectItem key={device.id} value={device.id}>
            {device.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}