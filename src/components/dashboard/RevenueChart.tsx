'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { useTheme } from 'next-themes';

interface RevenueData {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: isDark ? '#1a1a1a' : '#ffffff' // carbon-gray or white
        },
        textColor: isDark ? '#ffffff' : '#333333', // bright-white or dark gray
      },
      leftPriceScale: {
        visible: false,
      },
      width: chartContainerRef.current.clientWidth - 16, // Account for padding
      height: 272, // 288px (h-72) - 16px padding
      grid: {
        vertLines: { 
          color: isDark ? '#404040' : '#f0f0f0', // slate-gray
          style: 1,
        },
        horzLines: { 
          color: isDark ? '#404040' : '#f0f0f0',
          style: 1,
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#404040' : '#e0e0e0',
        autoScale: true,
      },
      timeScale: {
        borderColor: isDark ? '#404040' : '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 6,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDark ? '#00d9ff' : '#9B9B9B', // neon-cyan
          labelBackgroundColor: isDark ? '#00d9ff' : '#9B9B9B',
        },
        horzLine: {
          color: isDark ? '#00d9ff' : '#9B9B9B',
          labelBackgroundColor: isDark ? '#00d9ff' : '#9B9B9B',
        },
      },
    });

    try {
      const areaSeries = chart.addAreaSeries({
        lineColor: isDark ? '#00d9ff' : '#22c55e', // neon-cyan or green
        topColor: isDark ? 'rgba(0, 217, 255, 0.4)' : 'rgba(34, 197, 94, 0.4)',
        bottomColor: isDark ? 'rgba(0, 217, 255, 0.0)' : 'rgba(34, 197, 94, 0.0)',
        lineWidth: 2,
      });

      // Transform data to lightweight-charts format
      const chartData = data.map(item => ({
        time: item.date, // Format: 'YYYY-MM-DD'
        value: item.revenue,
      }));

      areaSeries.setData(chartData);
      chart.timeScale().fitContent();
    } catch (error) {
      console.error('Error creating chart series:', error);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth - 16 // Account for padding
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, isDark]);

  return (
    <div 
      ref={chartContainerRef} 
      className={`w-full rounded-lg border border-slate-gray/30 ${className}`}
      style={{ padding: '8px' }}
    />
  );
}