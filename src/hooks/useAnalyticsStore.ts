import { create } from 'zustand';
import { SensorData } from '@/lib/supabase';
import { addHours, endOfDay, startOfDay, subDays } from 'date-fns';

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | 'custom';

export type HealthRiskLevel = 'safe' | 'moderate' | 'unhealthy' | 'dangerous';

export interface HealthThresholds {
  co: { moderate: number; unhealthy: number; dangerous: number };
  co2: { moderate: number; unhealthy: number; dangerous: number };
  nh3: { moderate: number; unhealthy: number; dangerous: number };
  lpg: { moderate: number; unhealthy: number; dangerous: number };
  smoke: { moderate: number; unhealthy: number; dangerous: number };
  alcohol: { moderate: number; unhealthy: number; dangerous: number };
  temperature: { moderate: number; unhealthy: number; dangerous: number };
  humidity: { moderate: number; unhealthy: number; dangerous: number };
  sound_intensity: { moderate: number; unhealthy: number; dangerous: number };
}

export interface StatisticalSummary {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  variance: number;
}

export interface TrendData {
  value: number;
  movingAverage: number;
  timestamp: string;
}

interface AnalyticsState {
  // Time range selection
  selectedTimeRange: TimeRange;
  customStartDate: Date;
  customEndDate: Date;
  
  // Health thresholds
  healthThresholds: HealthThresholds;
  
  // Trend analysis
  movingAverageWindow: number;
  
  // Actions
  setTimeRange: (range: TimeRange) => void;
  setCustomDateRange: (start: Date, end: Date) => void;
  setMovingAverageWindow: (window: number) => void;
  updateHealthThresholds: (thresholds: Partial<HealthThresholds>) => void;
  
  // Computed values
  getDateRangeFromTimeRange: (selectedDate?: Date) => { start: Date; end: Date };
  calculateMovingAverage: (data: SensorData[], sensorKey: keyof SensorData) => TrendData[];
  calculateStatistics: (values: number[]) => StatisticalSummary;
  getHealthRiskLevel: (sensorType: keyof HealthThresholds, value: number) => HealthRiskLevel;
}

// Default health thresholds based on environmental standards
const defaultHealthThresholds: HealthThresholds = {
  co: { moderate: 9, unhealthy: 15, dangerous: 30 }, // ppm
  co2: { moderate: 1000, unhealthy: 5000, dangerous: 40000 }, // ppm
  nh3: { moderate: 25, unhealthy: 35, dangerous: 50 }, // ppm
  lpg: { moderate: 1000, unhealthy: 2000, dangerous: 5000 }, // ppm
  smoke: { moderate: 100, unhealthy: 300, dangerous: 500 }, // ppm
  alcohol: { moderate: 50, unhealthy: 100, dangerous: 200 }, // ppm
  temperature: { moderate: 30, unhealthy: 35, dangerous: 40 }, // °C
  humidity: { moderate: 70, unhealthy: 80, dangerous: 90 }, // %
  sound_intensity: { moderate: 70, unhealthy: 85, dangerous: 100 }, // dB
};

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  // Initial state
  selectedTimeRange: '24h',
  customStartDate: subDays(new Date(), 1),
  customEndDate: new Date(),
  healthThresholds: defaultHealthThresholds,
  movingAverageWindow: 5,
  
  // Actions
  setTimeRange: (range) => set({ selectedTimeRange: range }),
  
  setCustomDateRange: (start, end) => set({ 
    customStartDate: start, 
    customEndDate: end,
    selectedTimeRange: 'custom'
  }),
  
  setMovingAverageWindow: (window) => set({ movingAverageWindow: window }),
  
  updateHealthThresholds: (thresholds) => set((state) => ({
    healthThresholds: { ...state.healthThresholds, ...thresholds }
  })),
  
  // Computed functions
  getDateRangeFromTimeRange: (selectedDate?: Date) => {
    const { selectedTimeRange, customStartDate, customEndDate } = get();
    const date = selectedDate || new Date();
    
    switch (selectedTimeRange) {
      case '1h': {
        const start = startOfDay(date);
        return { start, end: addHours(start, 1) };
      }
      case '6h': {
        const start = startOfDay(date);
        return { start, end: addHours(start, 6) };
      }
      case '24h':
        return { start: startOfDay(date), end: endOfDay(date) };
      case '7d':
        return { start: startOfDay(subDays(date, 7)), end: endOfDay(date) };
      case '30d':
        return { start: startOfDay(subDays(date, 30)), end: endOfDay(date) };
      case 'custom':
        return { start: customStartDate, end: customEndDate };
      default:
        return { start: startOfDay(date), end: endOfDay(date) };
    }
  },
  
  calculateMovingAverage: (data, sensorKey) => {
    const { movingAverageWindow } = get();
    const values = data.map(d => Number(d[sensorKey]) || 0);
    const result: TrendData[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - movingAverageWindow + 1);
      const window = values.slice(start, i + 1);
      const movingAverage = window.reduce((sum, val) => sum + val, 0) / window.length;
      
      result.push({
        value: values[i],
        movingAverage,
        timestamp: data[i].created_at
      });
    }
    
    return result;
  },
  
  calculateStatistics: (values) => {
    if (values.length === 0) {
      return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0, variance: 0 };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, median, min, max, stdDev, variance };
  },
  
  getHealthRiskLevel: (sensorType, value) => {
    const { healthThresholds } = get();
    const thresholds = healthThresholds[sensorType];
    
    if (value >= thresholds.dangerous) return 'dangerous';
    if (value >= thresholds.unhealthy) return 'unhealthy';
    if (value >= thresholds.moderate) return 'moderate';
    return 'safe';
  }
}));