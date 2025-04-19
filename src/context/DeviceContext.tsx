'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
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
  const [error, setError] = useState<Error | null>(null);

  // Load devices on mount
  useEffect(() => {
    let isMounted = true;

    async function loadDevices() {
      try {
        setLoading(true);
        setError(null);
        const devicesData = await fetchDevices();
        if (isMounted) {
          setDevices(devicesData);
          
          // Auto-select the first device if none is selected
          if (devicesData.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(devicesData[0].id);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading devices:', error);
          setError(error instanceof Error ? error : new Error('Failed to load devices'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    loadDevices();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - selectedDeviceId is intentionally omitted to prevent refetching

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
  }, []); // Run only on mount

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({ devices, selectedDeviceId, setSelectedDeviceId, loading }),
    [devices, selectedDeviceId, loading]
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <DeviceContext.Provider value={contextValue}>
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