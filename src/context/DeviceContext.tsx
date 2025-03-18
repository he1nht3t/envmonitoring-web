'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Device, fetchDevices } from '@/lib/supabase';

interface DeviceContextType {
  devices: Device[];
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  loading: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load devices on mount
  useEffect(() => {
    async function loadDevices() {
      try {
        setLoading(true);
        const devicesData = await fetchDevices();
        setDevices(devicesData);
        
        // Set the first device as selected by default if available and no device is selected
        if (devicesData.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(devicesData[0].id);
        }
      } catch (error) {
        console.error('Error loading devices:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDevices();
  }, [selectedDeviceId]);

  // Save selected device to localStorage when it changes
  useEffect(() => {
    if (selectedDeviceId) {
      localStorage.setItem('selectedDeviceId', selectedDeviceId);
    }
  }, [selectedDeviceId]);

  // Load selected device from localStorage on mount
  useEffect(() => {
    const savedDeviceId = localStorage.getItem('selectedDeviceId');
    if (savedDeviceId) {
      setSelectedDeviceId(savedDeviceId);
    }
  }, [selectedDeviceId]);

  return (
    <DeviceContext.Provider value={{ devices, selectedDeviceId, setSelectedDeviceId, loading }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDeviceContext() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
}