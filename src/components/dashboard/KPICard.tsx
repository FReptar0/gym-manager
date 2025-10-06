'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon: LucideIcon;
  format?: 'currency' | 'number' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = 'number',
  trend = 'neutral',
  className 
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return formatCurrency(Number(val));
    }
    if (format === 'percentage') {
      return `${Number(val).toFixed(1)}%`;
    }
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  const getTrendColor = () => {
    if (!change) return 'text-stormy-weather';
    
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-stormy-weather';
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <Card className={cn("bg-midnight-magic border-stormy-weather/30", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-stormy-weather mb-1">{title}</p>
            <p className="text-2xl font-bold text-silver-setting">
              {formatValue(value)}
            </p>
            
            {change && (
              <div className="flex items-center gap-1 mt-2">
                <span className={cn("text-sm", getTrendColor())}>
                  {getTrendIcon()} {Math.abs(change.value).toFixed(1)}%
                </span>
                <span className="text-xs text-stormy-weather">
                  vs {change.period}
                </span>
              </div>
            )}
          </div>
          
          <div className="ml-4">
            <div className="p-3 bg-coastal-vista/10 rounded-lg">
              <Icon className="h-6 w-6 text-coastal-vista" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}