'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAnalyticsStore, HealthRiskLevel, HealthThresholds } from '@/hooks/useAnalyticsStore';
import { SensorData } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface HealthRiskIndicatorProps {
  sensorData: SensorData[];
  className?: string;
}

interface RiskConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
  label: string;
  description: string;
}

const riskConfigs: Record<HealthRiskLevel, RiskConfig> = {
  safe: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-700 dark:text-green-300',
    label: 'Safe',
    description: 'All readings within safe limits'
  },
  moderate: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    label: 'Moderate',
    description: 'Some readings elevated, monitor closely'
  },
  unhealthy: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-700 dark:text-orange-300',
    label: 'Unhealthy',
    description: 'Readings exceed healthy limits'
  },
  dangerous: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-700 dark:text-red-300',
    label: 'Dangerous',
    description: 'Immediate attention required'
  }
};

const sensorLabels: Record<keyof HealthThresholds, string> = {
  co: 'Carbon Monoxide',
  co2: 'Carbon Dioxide',
  nh3: 'Ammonia',
  lpg: 'LPG',
  smoke: 'Smoke',
  alcohol: 'Alcohol',
  temperature: 'Temperature',
  humidity: 'Humidity',
  sound_intensity: 'Sound Level'
};

const sensorUnits: Record<keyof HealthThresholds, string> = {
  co: 'ppm',
  co2: 'ppm',
  nh3: 'ppm',
  lpg: 'ppm',
  smoke: 'ppm',
  alcohol: 'ppm',
  temperature: '°C',
  humidity: '%',
  sound_intensity: 'dB'
};

export default function HealthRiskIndicator({ sensorData, className }: HealthRiskIndicatorProps) {
  const { getHealthRiskLevel, healthThresholds } = useAnalyticsStore();
  
  if (sensorData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Health Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No data available for health risk assessment
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate latest readings
  // const latestReading = sensorData[sensorData.length - 1];
  
  // Calculate average readings for overall assessment
  const averages = sensorData.reduce((acc, reading) => {
    Object.keys(healthThresholds).forEach(key => {
      const sensorKey = key as keyof HealthThresholds;
      acc[sensorKey] = (acc[sensorKey] || 0) + Number(reading[sensorKey]) || 0;
    });
    return acc;
  }, {} as Record<keyof HealthThresholds, number>);
  
  Object.keys(averages).forEach(key => {
    const sensorKey = key as keyof HealthThresholds;
    averages[sensorKey] = averages[sensorKey] / sensorData.length;
  });
  
  // Determine overall risk level
  const riskLevels = Object.keys(healthThresholds).map(key => {
    const sensorKey = key as keyof HealthThresholds;
    return getHealthRiskLevel(sensorKey, averages[sensorKey]);
  });
  
  const overallRisk: HealthRiskLevel = riskLevels.includes('dangerous') ? 'dangerous' :
                                      riskLevels.includes('unhealthy') ? 'unhealthy' :
                                      riskLevels.includes('moderate') ? 'moderate' : 'safe';
  
  const overallConfig = riskConfigs[overallRisk];
  
  // Get sensors that are above safe levels
  const alertSensors = Object.keys(healthThresholds)
    .map(key => {
      const sensorKey = key as keyof HealthThresholds;
      const risk = getHealthRiskLevel(sensorKey, averages[sensorKey]);
      return { sensor: sensorKey, risk, value: averages[sensorKey] };
    })
    .filter(item => item.risk !== 'safe')
    .sort((a, b) => {
      const riskOrder = { dangerous: 4, unhealthy: 3, moderate: 2, safe: 1 };
      return riskOrder[b.risk] - riskOrder[a.risk];
    });
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Health Risk Assessment
          <Badge 
            variant="outline" 
            className={cn(
              "ml-auto",
              overallConfig.bgColor,
              overallConfig.textColor
            )}
          >
            <div className={cn("w-2 h-2 rounded-full mr-2", overallConfig.color)} />
            {overallConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className={cn(
          "p-4 rounded-lg border",
          overallConfig.bgColor
        )}>
          <div className="flex items-center gap-3">
            <div className={overallConfig.textColor}>
              {overallConfig.icon}
            </div>
            <div>
              <div className={cn("font-medium", overallConfig.textColor)}>
                {overallConfig.label} Environment
              </div>
              <div className={cn("text-sm", overallConfig.textColor)}>
                {overallConfig.description}
              </div>
            </div>
          </div>
        </div>
        
        {/* Alert Sensors */}
        {alertSensors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Sensors Requiring Attention</h4>
            <div className="space-y-2">
              {alertSensors.map(({ sensor, risk, value }) => {
                const config = riskConfigs[risk];
                return (
                  <div 
                    key={sensor}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md border",
                      config.bgColor
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={config.textColor}>
                        {config.icon}
                      </div>
                      <div>
                        <div className={cn("font-medium text-sm", config.textColor)}>
                          {sensorLabels[sensor]}
                        </div>
                        <div className={cn("text-xs", config.textColor)}>
                          Current: {value.toFixed(2)} {sensorUnits[sensor]}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        config.textColor,
                        "border-current"
                      )}
                    >
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* All Sensors Grid */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">All Sensors Status</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.keys(healthThresholds).map(key => {
              const sensorKey = key as keyof HealthThresholds;
              const risk = getHealthRiskLevel(sensorKey, averages[sensorKey]);
              const config = riskConfigs[risk];
              
              return (
                <div 
                  key={sensorKey}
                  className="flex items-center justify-between p-2 rounded border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", config.color)} />
                    <span className="text-sm font-medium">
                      {sensorLabels[sensorKey]}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {averages[sensorKey].toFixed(1)} {sensorUnits[sensorKey]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Thresholds Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div>Risk levels based on environmental health standards</div>
          <div>Assessment based on average readings from selected time period</div>
        </div>
      </CardContent>
    </Card>
  );
}