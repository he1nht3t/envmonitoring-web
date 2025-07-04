'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Settings } from 'lucide-react';
import { useAnalyticsStore } from '@/hooks/useAnalyticsStore';
import { SensorData } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface TrendAnalysisChartProps {
  sensorData: SensorData[];
  sensorKey: keyof Omit<SensorData, 'id' | 'device_id' | 'created_at'>;
  title: string;
  unit: string;
  className?: string;
}

interface DataPoint {
  timestamp: Date;
  value: number;
  movingAverage: number;
}

export default function TrendAnalysisChart({
  sensorData,
  sensorKey,
  title,
  unit,
  className
}: TrendAnalysisChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { calculateMovingAverage, movingAverageWindow, setMovingAverageWindow } = useAnalyticsStore();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [showSettings, setShowSettings] = useState(false);
  
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  
  useEffect(() => {
    if (!svgRef.current || sensorData.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Prepare data
    const trendData = calculateMovingAverage(sensorData, sensorKey);
    const data: DataPoint[] = trendData.map(d => ({
      timestamp: parseISO(d.timestamp),
      value: d.value,
      movingAverage: d.movingAverage
    }));
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent([...data.map(d => d.value), ...data.map(d => d.movingAverage)]) as [number, number])
      .nice()
      .range([height, 0]);
    
    // Color scheme based on theme
    const colors = {
      primary: isDarkMode ? '#3b82f6' : '#2563eb',
      secondary: isDarkMode ? '#f97316' : '#ea580c',
      grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      text: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      axis: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
    };
    
    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)
      .selectAll('line')
      .style('stroke', colors.grid);
    
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)
      .selectAll('line')
      .style('stroke', colors.grid);
    
    // Line generators
    const valueLine = d3.line<DataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
    
    const movingAverageLine = d3.line<DataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.movingAverage))
      .curve(d3.curveMonotoneX);
    
    // Area under moving average
    const area = d3.area<DataPoint>()
      .x(d => xScale(d.timestamp))
      .y0(height)
      .y1(d => yScale(d.movingAverage))
      .curve(d3.curveMonotoneX);
    
    // Add area
    g.append('path')
      .datum(data)
      .attr('fill', colors.secondary)
      .attr('opacity', 0.1)
      .attr('d', area);
    
    // Add value line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .attr('opacity', 0.7)
      .attr('d', valueLine);
    
    // Add moving average line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colors.secondary)
      .attr('stroke-width', 3)
      .attr('d', movingAverageLine);
    
    // Add dots for actual values
    g.selectAll('.dot')
      .data(data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 50)) === 0))
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.timestamp))
      .attr('cy', d => yScale(d.value))
      .attr('r', 3)
      .attr('fill', colors.primary)
      .attr('opacity', 0.8);
    
    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => format(d as Date, 'HH:mm'))
      )
      .selectAll('text')
      .style('fill', colors.text)
      .style('font-size', '12px');
    
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', colors.text)
      .style('font-size', '12px');
    
    // Axis lines
    g.selectAll('.domain')
      .style('stroke', colors.axis);
    
    g.selectAll('.tick line')
      .style('stroke', colors.axis);
    
    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', colors.text)
      .style('font-size', '12px')
      .text(`${title} (${unit})`);
    
    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', isDarkMode ? '#333' : '#fff')
      .style('border', `1px solid ${isDarkMode ? '#555' : '#ccc'}`)
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('color', isDarkMode ? '#fff' : '#333')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('z-index', '1000');
    
    // Invisible overlay for mouse events
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);
        const bisectDate = d3.bisector((d: DataPoint) => d.timestamp).left;
        const i = bisectDate(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = d1 && (x0.getTime() - d0.timestamp.getTime() > d1.timestamp.getTime() - x0.getTime()) ? d1 : d0;
        
        if (d) {
          tooltip
            .style('visibility', 'visible')
            .html(`
              <div><strong>${format(d.timestamp, 'MMM d, HH:mm')}</strong></div>
              <div>Value: ${d.value.toFixed(2)} ${unit}</div>
              <div>Moving Avg: ${d.movingAverage.toFixed(2)} ${unit}</div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });
    
    // Cleanup tooltip on unmount
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [sensorData, sensorKey, movingAverageWindow, isDarkMode, calculateMovingAverage, title, unit, width, height, margin.top, margin.right, margin.bottom, margin.left]);
  
  if (sensorData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg">{title} - Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No data available for trend analysis
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const trendData = calculateMovingAverage(sensorData, sensorKey);
  const latestValue = trendData[trendData.length - 1];
  const previousValue = trendData[trendData.length - 2];
  const trend = latestValue && previousValue ? 
    latestValue.movingAverage - previousValue.movingAverage : 0;
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title} - Trend Analysis
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                trend > 0 && "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300",
                trend < 0 && "border-red-200 text-red-700 dark:border-red-800 dark:text-red-300",
                trend === 0 && "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
              )}
            >
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(2)} {unit}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Moving Average Window</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={movingAverageWindow}
                  onChange={(e) => setMovingAverageWindow(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{movingAverageWindow}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Adjust the number of data points used for moving average calculation
              </div>
            </div>
          </div>
        )}
        
        <div className="w-full overflow-x-auto">
          <svg ref={svgRef} className="w-full h-auto" />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span>Actual Values</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-orange-500" />
              <span>Moving Average ({movingAverageWindow} points)</span>
            </div>
          </div>
          <div className="text-muted-foreground">
            {sensorData.length} data points
          </div>
        </div>
      </CardContent>
    </Card>
  );
}