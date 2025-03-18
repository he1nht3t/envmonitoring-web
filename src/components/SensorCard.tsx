'use client';

import { SensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  timestamp: string;
  color: string;
}

export default function SensorCard({ title, value, unit, icon, timestamp, color }: SensorCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`text-${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toFixed(1)} {unit}
        </div>
        <p className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(timestamp))} ago
        </p>
      </CardContent>
    </Card>
  );
}

// Component to display a grid of sensor cards
interface SensorGridProps {
  sensorData: SensorData;
}

export function SensorGrid({ sensorData }: SensorGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <SensorCard
        title="Temperature"
        value={sensorData.temperature}
        unit="°C"
        icon={<TemperatureIcon />}
        timestamp={sensorData.created_at}
        color="orange-500"
      />
      <SensorCard
        title="Humidity"
        value={sensorData.humidity}
        unit="%"
        icon={<HumidityIcon />}
        timestamp={sensorData.created_at}
        color="blue-500"
      />
      <SensorCard
        title="CO2"
        value={sensorData.co2}
        unit="ppm"
        icon={<CO2Icon />}
        timestamp={sensorData.created_at}
        color="gray-500"
      />
      <SensorCard
        title="CO"
        value={sensorData.co}
        unit="ppm"
        icon={<COIcon />}
        timestamp={sensorData.created_at}
        color="red-500"
      />
      <SensorCard
        title="NH3"
        value={sensorData.nh3}
        unit="ppm"
        icon={<GasIcon />}
        timestamp={sensorData.created_at}
        color="purple-500"
      />
      <SensorCard
        title="LPG"
        value={sensorData.lpg}
        unit="ppm"
        icon={<GasIcon />}
        timestamp={sensorData.created_at}
        color="green-500"
      />
      <SensorCard
        title="Smoke"
        value={sensorData.smoke}
        unit="ppm"
        icon={<SmokeIcon />}
        timestamp={sensorData.created_at}
        color="slate-500"
      />
      <SensorCard
        title="Alcohol"
        value={sensorData.alcohol}
        unit="ppm"
        icon={<GasIcon />}
        timestamp={sensorData.created_at}
        color="pink-500"
      />
      <SensorCard
        title="Sound"
        value={sensorData.sound_intensity}
        unit="dB"
        icon={<SoundIcon />}
        timestamp={sensorData.created_at}
        color="yellow-500"
      />
      <SensorCard
        title="Rain"
        value={sensorData.rain_intensity}
        unit="mm"
        icon={<RainIcon />}
        timestamp={sensorData.created_at}
        color="sky-500"
      />
    </div>
  );
}

// Simple icon components
function TemperatureIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function CO2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
      <path d="M17 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
      <path d="M12 17a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
    </svg>
  );
}

function COIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="12" r="5" />
      <circle cx="17" cy="12" r="5" />
    </svg>
  );
}

function GasIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22h20" />
      <path d="M12 2c-5 0-8 2-8 6v12h16V8c0-4-3-6-8-6Z" />
      <path d="M6 12a6 6 0 0 0 12 0" />
    </svg>
  );
}

function SmokeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1 0-2h6a1 1 0 0 0 1-1V9a1 1 0 0 1 2 0v2a3 3 0 0 1-3 3H4Z" />
      <path d="M12 8a1 1 0 0 0 1-1V5a1 1 0 0 1 2 0v2a3 3 0 0 1-3 3H8a1 1 0 0 1 0-2h4Z" />
      <path d="M18 10a1 1 0 0 0 0-2h-2a1 1 0 0 1 0-2h2a3 3 0 0 1 0 6h-2a1 1 0 0 1 0-2h2Z" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10v3" />
      <path d="M6 6v11" />
      <path d="M10 3v18" />
      <path d="M14 8v7" />
      <path d="M18 5v13" />
      <path d="M22 10v3" />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
    </svg>
  );
} 