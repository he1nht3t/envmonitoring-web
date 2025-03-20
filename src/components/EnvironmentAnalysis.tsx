'use client';

import { SensorData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface EnvironmentAnalysisProps {
  sensorData: SensorData[];
  deviceName: string;
}

interface AnalysisResult {
  temperature: {
    avg: number;
    trend: 'rising' | 'falling' | 'stable';
    status: 'normal' | 'warning' | 'critical';
  };
  humidity: {
    avg: number;
    trend: 'rising' | 'falling' | 'stable';
    status: 'normal' | 'warning' | 'critical';
  };
  airQuality: {
    status: 'good' | 'moderate' | 'poor' | 'unhealthy' | 'hazardous';
    pollutants: string[];
  };
  noise: {
    avg: number;
    status: 'quiet' | 'moderate' | 'loud' | 'very loud';
  };
  rain: {
    avg: number;
    status: 'none' | 'light' | 'moderate' | 'heavy';
  };
  summary: string;
}

export default function EnvironmentAnalysis({ sensorData, deviceName }: EnvironmentAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sensorData.length === 0) {
      setLoading(false);
      return;
    }

    // Analyze the sensor data
    const result = analyzeEnvironmentData(sensorData);
    setAnalysis(result);
    setLoading(false);
  }, [sensorData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Environment Analysis</CardTitle>
          <CardDescription>Analyzing data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p>Loading analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || sensorData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Environment Analysis</CardTitle>
          <CardDescription>No data available for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p>Insufficient data to generate analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{deviceName} - Environment Analysis</CardTitle>
        <CardDescription>
          Analysis based on {sensorData.length} recent readings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <h3 className="font-medium text-lg mb-2">Summary</h3>
            <p>{analysis.summary}</p>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Temperature Analysis */}
            <div className="bg-white p-4 rounded-md border border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Temperature</h3>
                <StatusBadge status={analysis.temperature.status} />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{analysis.temperature.avg.toFixed(1)}°C</p>
                <div className="flex items-center mt-1">
                  <TrendIndicator trend={analysis.temperature.trend} />
                  <span className="text-sm ml-1">
                    {analysis.temperature.trend === 'rising' ? 'Rising' : 
                     analysis.temperature.trend === 'falling' ? 'Falling' : 'Stable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Humidity Analysis */}
            <div className="bg-white p-4 rounded-md border border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Humidity</h3>
                <StatusBadge status={analysis.humidity.status} />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{analysis.humidity.avg.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <TrendIndicator trend={analysis.humidity.trend} />
                  <span className="text-sm ml-1">
                    {analysis.humidity.trend === 'rising' ? 'Rising' : 
                     analysis.humidity.trend === 'falling' ? 'Falling' : 'Stable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Air Quality Analysis */}
            <div className="bg-white p-4 rounded-md border border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Air Quality</h3>
                <AirQualityBadge status={analysis.airQuality.status} />
              </div>
              <div className="mt-2">
                <p className="text-sm">Main pollutants:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.airQuality.pollutants.map((pollutant, index) => (
                    <span key={index} className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded">
                      {pollutant}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Noise Analysis */}
            <div className="bg-white p-4 rounded-md border border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Noise Level</h3>
                <NoiseBadge status={analysis.noise.status} />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{analysis.noise.avg.toFixed(1)} dB</p>
                <p className="text-sm text-slate-500 mt-1">
                  {analysis.noise.status === 'quiet' ? 'Quiet environment' :
                   analysis.noise.status === 'moderate' ? 'Moderate noise level' :
                   analysis.noise.status === 'loud' ? 'Loud environment' : 'Very loud environment'}
                </p>
              </div>
            </div>

            {/* Rain Analysis */}
            <div className="bg-white p-4 rounded-md border border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Rain Intensity</h3>
                <RainBadge status={analysis.rain.status} />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{analysis.rain.avg.toFixed(1)} mm</p>
                <p className="text-sm text-slate-500 mt-1">
                  {analysis.rain.status === 'none' ? 'No rain detected' :
                   analysis.rain.status === 'light' ? 'Light rain' :
                   analysis.rain.status === 'moderate' ? 'Moderate rain' : 'Heavy rain'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper components
function StatusBadge({ status }: { status: 'normal' | 'warning' | 'critical' }) {
  const bgColor = 
    status === 'normal' ? 'bg-green-100 text-green-800' :
    status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';

  return (
    <span className={`text-xs px-2 py-1 rounded ${bgColor}`}>
      {status === 'normal' ? 'Normal' :
       status === 'warning' ? 'Warning' : 'Critical'}
    </span>
  );
}

function AirQualityBadge({ status }: { status: 'good' | 'moderate' | 'poor' | 'unhealthy' | 'hazardous' }) {
  const bgColor = 
    status === 'good' ? 'bg-green-100 text-green-800' :
    status === 'moderate' ? 'bg-blue-100 text-blue-800' :
    status === 'poor' ? 'bg-yellow-100 text-yellow-800' :
    status === 'unhealthy' ? 'bg-orange-100 text-orange-800' :
    'bg-red-100 text-red-800';

  return (
    <span className={`text-xs px-2 py-1 rounded ${bgColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function RainBadge({ status }: { status: 'none' | 'light' | 'moderate' | 'heavy' }) {
  const bgColor = 
    status === 'none' ? 'bg-slate-100 text-slate-800' :
    status === 'light' ? 'bg-blue-100 text-blue-800' :
    status === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';

  return (
    <span className={`text-xs px-2 py-1 rounded ${bgColor}`}>
      {status === 'none' ? 'None' :
       status === 'light' ? 'Light' :
       status === 'moderate' ? 'Moderate' : 'Heavy'}
    </span>
  );
}

function NoiseBadge({ status }: { status: 'quiet' | 'moderate' | 'loud' | 'very loud' }) {
  const bgColor = 
    status === 'quiet' ? 'bg-green-100 text-green-800' :
    status === 'moderate' ? 'bg-blue-100 text-blue-800' :
    status === 'loud' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';

  return (
    <span className={`text-xs px-2 py-1 rounded ${bgColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TrendIndicator({ trend }: { trend: 'rising' | 'falling' | 'stable' }) {
  if (trend === 'rising') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <path d="m18 9-6-6-6 6"/>
        <path d="M6 20h12"/>
      </svg>
    );
  } else if (trend === 'falling') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
        <path d="m6 9 6 6 6-6"/>
        <path d="M6 20h12"/>
      </svg>
    );
  } else {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M8 12h8"/>
        <path d="M6 20h12"/>
      </svg>
    );
  }
}

// Analysis function
function analyzeEnvironmentData(data: SensorData[]): AnalysisResult {
  // Sort data by timestamp (newest first)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate averages
  const tempSum = sortedData.reduce((sum, item) => sum + item.temperature, 0);
  const tempAvg = tempSum / sortedData.length;
  
  const humiditySum = sortedData.reduce((sum, item) => sum + item.humidity, 0);
  const humidityAvg = humiditySum / sortedData.length;
  
  const soundSum = sortedData.reduce((sum, item) => sum + item.sound_intensity, 0);
  const soundAvg = soundSum / sortedData.length;

  // Determine trends (using first half vs second half of data)
  const midpoint = Math.floor(sortedData.length / 2);
  const recentData = sortedData.slice(0, midpoint);
  const olderData = sortedData.slice(midpoint);

  const recentTempAvg = recentData.reduce((sum, item) => sum + item.temperature, 0) / recentData.length;
  const olderTempAvg = olderData.reduce((sum, item) => sum + item.temperature, 0) / olderData.length;
  const tempTrend = determineTrend(recentTempAvg, olderTempAvg);

  const recentHumidityAvg = recentData.reduce((sum, item) => sum + item.humidity, 0) / recentData.length;
  const olderHumidityAvg = olderData.reduce((sum, item) => sum + item.humidity, 0) / olderData.length;
  const humidityTrend = determineTrend(recentHumidityAvg, olderHumidityAvg);

  // Determine temperature status
  let tempStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (tempAvg > 30) {
    tempStatus = 'critical';
  } else if (tempAvg > 28 || tempAvg < 15) {
    tempStatus = 'warning';
  }

  // Determine humidity status
  let humidityStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (humidityAvg > 80 || humidityAvg < 20) {
    humidityStatus = 'critical';
  } else if (humidityAvg > 70 || humidityAvg < 30) {
    tempStatus = 'warning';
  }

  // Analyze air quality
  const co2Avg = sortedData.reduce((sum, item) => sum + item.co2, 0) / sortedData.length;
  const coAvg = sortedData.reduce((sum, item) => sum + item.co, 0) / sortedData.length;
  const nh3Avg = sortedData.reduce((sum, item) => sum + item.nh3, 0) / sortedData.length;
  const lpgAvg = sortedData.reduce((sum, item) => sum + item.lpg, 0) / sortedData.length;
  const smokeAvg = sortedData.reduce((sum, item) => sum + item.smoke, 0) / sortedData.length;
  const alcoholAvg = sortedData.reduce((sum, item) => sum + item.alcohol, 0) / sortedData.length;

  // Determine air quality status and pollutants
  let airQualityStatus: 'good' | 'moderate' | 'poor' | 'unhealthy' | 'hazardous' = 'good';
  const pollutants: string[] = [];

  // Check each pollutant and update status with more sensitive thresholds
  if (co2Avg > 800) {
    pollutants.push('High CO2');
    airQualityStatus = airQualityStatus === 'good' ? 'moderate' : airQualityStatus;
  }
  if (coAvg > 5) {
    pollutants.push('High CO');
    airQualityStatus = 'hazardous';
  }
  if (nh3Avg > 15) {
    pollutants.push('High NH3');
    airQualityStatus = airQualityStatus === 'good' ? 'poor' : airQualityStatus;
  }
  if (lpgAvg > 500) {
    pollutants.push('High LPG');
    airQualityStatus = 'unhealthy';
  }
  if (smokeAvg > 50) {
    pollutants.push('Smoke detected');
    airQualityStatus = airQualityStatus === 'good' ? 'poor' : airQualityStatus;
  }
  if (alcoholAvg > 50) {
    pollutants.push('High Alcohol vapor');
    airQualityStatus = airQualityStatus === 'good' ? 'moderate' : airQualityStatus;
  }

  // Determine noise level status
  let noiseStatus: 'quiet' | 'moderate' | 'loud' | 'very loud' = 'quiet';
  if (soundAvg > 85) {
    noiseStatus = 'very loud';
  } else if (soundAvg > 75) {
    noiseStatus = 'loud';
  } else if (soundAvg > 60) {
    noiseStatus = 'moderate';
  }

  // Determine rain intensity status
  let rainStatus: 'none' | 'light' | 'moderate' | 'heavy' = 'none';
  const rainAvg = sortedData.reduce((sum, item) => sum + item.rain_intensity, 0) / sortedData.length;
  
  if (rainAvg > 7.5) {
    rainStatus = 'heavy';
  } else if (rainAvg > 2.5) {
    rainStatus = 'moderate';
  } else if (rainAvg > 0.1) {
    rainStatus = 'light';
  }

  // Generate summary
  let summary = `Environment analysis shows `;
  
  // Add temperature and humidity info
  summary += `temperature is ${tempAvg.toFixed(1)}°C (${tempTrend}) and humidity is ${humidityAvg.toFixed(1)}% (${humidityTrend}). `;
  
  // Add air quality info
  if (pollutants.length > 0) {
    summary += `Air quality is ${airQualityStatus} with ${pollutants.join(', ')}. `;
  } else {
    summary += `Air quality is good with no significant pollutants detected. `;
  }
  
  // Add noise level info
  summary += `Noise level is ${noiseStatus} at ${soundAvg.toFixed(1)} dB. `;
  
  // Add rain intensity info
  if (rainStatus !== 'none') {
    summary += `Rain intensity is ${rainStatus} at ${rainAvg.toFixed(1)} mm.`;
  } else {
    summary += `No rain detected.`;
  }

  return {
    temperature: {
      avg: tempAvg,
      trend: tempTrend,
      status: tempStatus
    },
    humidity: {
      avg: humidityAvg,
      trend: humidityTrend,
      status: humidityStatus
    },
    airQuality: {
      status: airQualityStatus,
      pollutants
    },
    noise: {
      avg: soundAvg,
      status: noiseStatus
    },
    rain: {
      avg: rainAvg,
      status: rainStatus
    },
    summary
  };
}

// Helper function to determine trend
function determineTrend(recent: number, older: number): 'rising' | 'falling' | 'stable' {
  const difference = recent - older;
  const threshold = 0.5; // Minimum difference to consider a trend
  
  if (Math.abs(difference) < threshold) {
    return 'stable';
  }
  return difference > 0 ? 'rising' : 'falling';
}