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
export async function fetchSensorData(deviceId: string, limit = 100, startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('sensor_data')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  // If date is provided, filter data for that specific day
  if (startDate && endDate) {
    query = query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching sensor data:', error);
    return [];
  }
  
  return data as SensorData[];
}

// Fetch all sensor data for a specific device with optional date filter
export async function fetchAllSensorData(deviceId: string, startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('sensor_data')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });
  
  // If date is provided, filter data for that specific day
  if (startDate && endDate) {
    query = query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching sensor data:', error);
    return [];
  }
  
  return data as SensorData[];
}

// Fetch latest sensor data for all devices with optional date filter
export async function fetchLatestSensorData(startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('sensor_data')
    .select('*')
    .order('created_at', { ascending: false });
  
  // If date is provided, filter data for that specific day
  if (startDate && endDate) {
    query = query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
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

// Check if profiles table exists and is accessible
export async function checkProfilesTable(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error checking profiles table:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking profiles table:', error);
    return false;
  }
}

// Get user role from profiles table
export async function getUserRole(userId: string): Promise<string> {
  if (!userId) {
    console.warn('No user ID provided to getUserRole');
    return 'user'; // Default role when no user ID is provided
  }
  
  try {
    // Check if the table exists first
    const tableExists = await checkProfilesTable();
    if (!tableExists) {
      console.warn('profiles table does not exist or is not accessible');
      return 'user'; // Default role when table doesn't exist
    }
    
    // Now try to get the user's role from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      // If the error is "no rows returned", it means the user doesn't have a role assigned
      if (error.code === 'PGRST116') {
        console.info(`No role found for user ${userId}, using default role 'user'`);
        return 'user';
      }
      
      console.error('Error fetching user role:', error);
      return 'user'; // Default role
    }
    
    return data?.role || 'user';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default role
  }
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}

// Device CRUD operations
export async function createDevice(device: Omit<Device, 'id'>): Promise<{ data: Device | null, error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('devices')
      .insert(device)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateDevice(id: string, device: Partial<Omit<Device, 'id'>>): Promise<{ data: Device | null, error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('devices')
      .update(device)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteDevice(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id);
    
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}