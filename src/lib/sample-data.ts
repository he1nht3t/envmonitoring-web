import { Device, SensorData } from './supabase';

// Sample device data for testing
export const sampleDevices: Device[] = [
  {
    id: '1',
    name: 'Device 1 - Office',
    lat: 1.3521,
    long: 103.8198
  },
  {
    id: '2',
    name: 'Device 2 - Garden',
    lat: 1.3551,
    long: 103.8298
  },
  {
    id: '3',
    name: 'Device 3 - Rooftop',
    lat: 1.3491,
    long: 103.8148
  },
  {
    id: '4',
    name: 'Device 4 - Lobby',
    lat: 1.3571,
    long: 103.8218
  }
];

// Generate sample sensor data
export const generateSampleSensorData = (): Record<string, SensorData> => {
  const now = new Date();
  
  return sampleDevices.reduce((acc, device) => {
    acc[device.id] = {
      id: `sensor-${device.id}`,
      device_id: device.id,
      temperature: 20 + Math.random() * 15, // 20-35°C
      humidity: 40 + Math.random() * 40, // 40-80%
      co: 0.5 + Math.random() * 2, // 0.5-2.5 ppm
      co2: 350 + Math.random() * 650, // 350-1000 ppm
      nh3: 0.1 + Math.random() * 0.9, // 0.1-1 ppm
      lpg: 0.1 + Math.random() * 0.9, // 0.1-1 ppm
      smoke: 0.1 + Math.random() * 0.9, // 0.1-1 ppm
      alcohol: 0.1 + Math.random() * 0.9, // 0.1-1 ppm
      sound_intensity: 30 + Math.random() * 40, // 30-70 dB
      rain_intensity: Math.random() * 10, // 0-10 mm/h
      created_at: now.toISOString()
    };
    return acc;
  }, {} as Record<string, SensorData>);
};

// Generate sample sensor data history for a device
export const generateSampleSensorHistory = (deviceId: string, count: number = 20): SensorData[] => {
  const result: SensorData[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000); // 15 minutes intervals
    
    result.push({
      id: `sensor-${deviceId}-${i}`,
      device_id: deviceId,
      temperature: 20 + Math.random() * 15, // 20-35°C
      humidity: 40 + Math.random() * 40, // 40-80%
      co: 0.5 + Math.random() * 2, // 0.5-2.5 ppm
      co2: 350 + Math.random() * 650, // 350-1000 ppm
      nh3: 0.1 + Math.random() * 0.9, // 0.1-1 ppm
      lpg: 0.1 + Math.random() * 0.9, // 0.1-1 ppm
      smoke: 0.1 + Math.random() * 0.9, // 0.1-1 ppm
      alcohol: 0.1 + Math.random() * 0.9, // 0.1-1 ppm
      sound_intensity: 30 + Math.random() * 40, // 30-70 dB
      rain_intensity: Math.random() * 10, // 0-10 mm/h
      created_at: timestamp.toISOString()
    });
  }
  
  return result;
}; 