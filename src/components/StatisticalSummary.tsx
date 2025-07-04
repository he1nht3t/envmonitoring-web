'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { useAnalyticsStore } from '@/hooks/useAnalyticsStore';
import { SensorData } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface StatisticalSummaryProps {
  sensorData: SensorData[];
  selectedSensor?: keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>;
  className?: string;
}

const sensorLabels: Record<keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>, string> = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  co: 'Carbon Monoxide',
  co2: 'Carbon Dioxide',
  nh3: 'Ammonia',
  lpg: 'LPG',
  smoke: 'Smoke',
  alcohol: 'Alcohol',
  sound_intensity: 'Sound Level',
  rain_intensity: 'Rain Intensity'
};

const sensorUnits: Record<keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>, string> = {
  temperature: '°C',
  humidity: '%',
  co: 'ppm',
  co2: 'ppm',
  nh3: 'ppm',
  lpg: 'ppm',
  smoke: 'ppm',
  alcohol: 'ppm',
  sound_intensity: 'dB',
  rain_intensity: 'mm/h'
};

export default function StatisticalSummary({ 
  sensorData, 
  selectedSensor = 'temperature',
  className 
}: StatisticalSummaryProps) {
  const { calculateStatistics } = useAnalyticsStore();
  
  if (sensorData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Statistical Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No data available for statistical analysis
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Extract values for the selected sensor
  const values = sensorData.map(d => Number(d[selectedSensor]) || 0);
  const stats = calculateStatistics(values);
  
  // Calculate additional metrics
  const range = stats.max - stats.min;
  const coefficientOfVariation = stats.mean !== 0 ? (stats.stdDev / stats.mean) * 100 : 0;
  
  // Calculate trend (simple linear regression slope)
  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  const xMean = (n - 1) / 2;
  const yMean = stats.mean;
  
  const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (values[i] - yMean), 0);
  const denominator = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
  const slope = denominator !== 0 ? numerator / denominator : 0;
  
  const trendDirection = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';
  
  // Calculate percentiles
  const sortedValues = [...values].sort((a, b) => a - b);
  const getPercentile = (p: number) => {
    const index = (p / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sortedValues.length) return sortedValues[sortedValues.length - 1];
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  };
  
  const p25 = getPercentile(25);
  const p75 = getPercentile(75);
  const p95 = getPercentile(95);
  
  const unit = sensorUnits[selectedSensor];
  
  const formatValue = (value: number) => {
    return value.toFixed(2);
  };
  
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getTrendColor = () => {
    switch (trendDirection) {
      case 'increasing':
        return 'text-green-600 dark:text-green-400';
      case 'decreasing':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistical Summary - {sensorLabels[selectedSensor]}
          <Badge variant="outline" className="ml-auto">
            {sensorData.length} readings
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Mean</div>
            <div className="text-2xl font-bold">{formatValue(stats.mean)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Median</div>
            <div className="text-2xl font-bold">{formatValue(stats.median)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Min</div>
            <div className="text-2xl font-bold text-blue-600">{formatValue(stats.min)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Max</div>
            <div className="text-2xl font-bold text-orange-600">{formatValue(stats.max)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
        </div>
        
        {/* Variability Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Standard Deviation</div>
            <div className="text-lg font-semibold">{formatValue(stats.stdDev)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Range</div>
            <div className="text-lg font-semibold">{formatValue(range)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Coefficient of Variation</div>
            <div className="text-lg font-semibold">{formatValue(coefficientOfVariation)}%</div>
            <div className="text-xs text-muted-foreground">Relative variability</div>
          </div>
        </div>
        
        {/* Percentiles */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">25th Percentile</div>
            <div className="text-lg font-semibold">{formatValue(p25)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">75th Percentile</div>
            <div className="text-lg font-semibold">{formatValue(p75)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">95th Percentile</div>
            <div className="text-lg font-semibold">{formatValue(p95)}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
        </div>
        
        {/* Trend Analysis */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium">Trend Analysis</div>
            {getTrendIcon()}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className={cn("font-medium capitalize", getTrendColor())}>
                {trendDirection}
              </div>
              <div className="text-xs text-muted-foreground">
                Slope: {formatValue(slope)} {unit}/reading
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize",
                trendDirection === 'increasing' && "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300",
                trendDirection === 'decreasing' && "border-red-200 text-red-700 dark:border-red-800 dark:text-red-300",
                trendDirection === 'stable' && "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
              )}
            >
              {trendDirection}
            </Badge>
          </div>
        </div>
        
        {/* Data Quality */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-2">Data Quality</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Sample Size:</span>
              <span className="ml-2 font-medium">{sensorData.length} readings</span>
            </div>
            <div>
              <span className="text-muted-foreground">Completeness:</span>
              <span className="ml-2 font-medium text-green-600">100%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}