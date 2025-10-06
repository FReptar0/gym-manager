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
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: isDark ? '#47484a' : '#ffffff' // midnight-magic or white
        },
        textColor: isDark ? '#d9dada' : '#333333', // silver-setting or dark gray
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      grid: {
        vertLines: { 
          color: isDark ? '#657079' : '#f0f0f0', // stormy-weather
          style: 1,
        },
        horzLines: { 
          color: isDark ? '#657079' : '#f0f0f0',
          style: 1,
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#657079' : '#e0e0e0',
        autoScale: true,
      },
      timeScale: {
        borderColor: isDark ? '#657079' : '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDark ? '#8194a1' : '#9B9B9B', // coastal-vista
          labelBackgroundColor: isDark ? '#8194a1' : '#9B9B9B',
        },
        horzLine: {
          color: isDark ? '#8194a1' : '#9B9B9B',
          labelBackgroundColor: isDark ? '#8194a1' : '#9B9B9B',
        },
      },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: isDark ? '#8194a1' : '#22c55e', // coastal-vista or green
      topColor: isDark ? 'rgba(129, 148, 161, 0.4)' : 'rgba(34, 197, 94, 0.4)',
      bottomColor: isDark ? 'rgba(129, 148, 161, 0.0)' : 'rgba(34, 197, 94, 0.0)',
      lineWidth: 2,
    });

    // Transform data to lightweight-charts format
    const chartData = data.map(item => ({
      time: item.date, // Format: 'YYYY-MM-DD'
      value: item.revenue,
    }));

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
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
      className={`w-full rounded-lg overflow-hidden border border-stormy-weather/30 ${className}`}
    />
  );
}