import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions based on the database schema shown in the image
export type SensorData = {
  id: string;
  device_id: string;
  temperature: number;
  humidity: number;
  co: number;
  co2: number;
  nh3: number;
  lpg: number;
  smoke: number;
  alcohol: number;
  sound_intensity: number;
  rain_intensity: number;
  created_at: string;
};

export type Device = {
  id: string;
  name: string;
  lat: number;
  long: number;
};

// Function to fetch all devices
export async function fetchDevices() {
  const { data, error } = await supabase
    .from('devices')
    .select('*');
  
  if (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
  
  return data as Device[];
}

// Fetch sensor data for a specific device with optional date filter
export async function fetchSensorData(deviceId: string, limit = 100, date?: Date) {
  let query = supabase
    .from('sensor_data')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  // If date is provided, filter data for that specific day
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query = query
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching sensor data:', error);
    return [];
  }
  
  return data as SensorData[];
}

// Fetch latest sensor data for all devices with optional date filter
export async function fetchLatestSensorData(date?: Date) {
  let query = supabase
    .from('sensor_data')
    .select('*')
    .order('created_at', { ascending: false });
  
  // If date is provided, filter data for that specific day
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query = query
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching latest sensor data:', error);
    return [];
  }
  
  // Group by device_id and take the latest entry for each device
  const latestByDevice = data.reduce((acc: Record<string, SensorData>, item: SensorData) => {
    if (!acc[item.device_id] || new Date(item.created_at) > new Date(acc[item.device_id].created_at)) {
      acc[item.device_id] = item;
    }
    return acc;
  }, {});
  
  return Object.values(latestByDevice) as SensorData[];
}

// Subscribe to real-time updates for sensor data
export function subscribeToSensorData(callback: (payload: { new: SensorData }) => void) {
  return supabase
    .channel('sensor_data_changes')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'sensor_data' 
    }, callback)
    .subscribe();
}