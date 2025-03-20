'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { Device, SensorData } from '@/lib/supabase';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix for Leaflet marker icon in Next.js
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create a colored marker based on temperature
const createColoredMarker = (temperature: number) => {
  // Define color based on temperature
  let color = '#3388ff'; // default blue
  if (temperature > 30) {
    color = '#ff3333'; // hot - red
  } else if (temperature > 25) {
    color = '#ff9933'; // warm - orange
  } else if (temperature < 15) {
    color = '#33ccff'; // cold - light blue
  }

  return divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Component to fit map to markers
function FitBoundsToMarkers({ devices, focusSelectedDevice, selectedDeviceId }: { devices: Device[], focusSelectedDevice?: boolean, selectedDeviceId?: string }) {
  const map = useMap();
  
  useEffect(() => {
    if (devices.length > 0) {
      try {
        // If focusing on selected device and we have a selected device ID
        if (focusSelectedDevice && selectedDeviceId) {
          const selectedDevice = devices.find(device => device.id === selectedDeviceId);
          
          if (selectedDevice) {
            // Center map on selected device with higher zoom level
            map.setView([selectedDevice.lat, selectedDevice.long], 15);
            return;
          }
        }
        
        // Otherwise fit bounds to all devices
        const bounds = devices.map(device => [device.lat, device.long]);
        map.fitBounds(bounds as [number, number][]);
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [devices, map, focusSelectedDevice, selectedDeviceId]);
  
  return null;
}

interface MapProps {
  devices: Device[];
  sensorData: Record<string, SensorData>;
  focusSelectedDevice?: boolean;
  selectedDeviceId?: string;
}

const Map = ({ devices, sensorData, focusSelectedDevice = false, selectedDeviceId }: MapProps) => {
  // Find center of all devices or default to a location
  const getMapCenter = () => {
    if (devices.length === 0) return [0, 0];
    
    try {
      const totalLat = devices.reduce((sum, device) => sum + device.lat, 0);
      const totalLong = devices.reduce((sum, device) => sum + device.long, 0);
      
      return [totalLat / devices.length, totalLong / devices.length];
    } catch (error) {
      console.error('Error calculating map center:', error);
      return [0, 0];
    }
  };

  return (
    <MapContainer 
      center={getMapCenter() as [number, number]} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Fit map to markers */}
      {devices.length > 0 && <FitBoundsToMarkers devices={devices} focusSelectedDevice={focusSelectedDevice} selectedDeviceId={selectedDeviceId} />}
      
      {devices.map(device => {
        // Get the device's sensor data if available
        const deviceData = sensorData[device.id];
        // Choose icon based on temperature if available
        const icon = deviceData 
          ? createColoredMarker(deviceData.temperature) 
          : customIcon;
        
        return (
          <Marker 
            key={device.id} 
            position={[device.lat, device.long]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[280px]">
                <h3 className="font-bold text-lg">{device.name}</h3>
                {deviceData ? (
                  <div className="text-sm mt-2">
                    <div className="flex flex-col space-y-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">Temperature:</span> 
                          <span className="font-medium ml-2">{deviceData.temperature.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">Humidity:</span> 
                          <span className="font-medium ml-2">{deviceData.humidity.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">CO2:</span> 
                          <span className="font-medium ml-2">{deviceData.co2.toFixed(1)} ppm</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">CO:</span> 
                          <span className="font-medium ml-2">{deviceData.co.toFixed(1)} ppm</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">LPG:</span> 
                          <span className="font-medium ml-2">{deviceData.lpg.toFixed(1)} ppm</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">NH3:</span> 
                          <span className="font-medium ml-2">{deviceData.nh3.toFixed(1)} ppm</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">Alcohol:</span> 
                          <span className="font-medium ml-2">{deviceData.alcohol.toFixed(1)} ppm</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">Smoke:</span> 
                          <span className="font-medium ml-2">{deviceData.smoke.toFixed(1)} ppm</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">Sound:</span> 
                          <span className="font-medium ml-2">{deviceData.sound_intensity.toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">Rain:</span> 
                          <span className="font-medium ml-2">{deviceData.rain_intensity.toFixed(1)} mm/h</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last Updated: {new Date(deviceData.created_at).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm mt-2 text-gray-500">No sensor data available</p>
                )}
                <p className="text-xs mt-2">
                  Location: {device.lat.toFixed(6)}, {device.long.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;