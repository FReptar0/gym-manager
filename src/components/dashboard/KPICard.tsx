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
    if (!change) return 'text-light-gray';
    
    if (trend === 'up') return 'text-electric-lime';
    if (trend === 'down') return 'text-hot-orange';
    return 'text-light-gray';
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <Card className={cn("bg-carbon-gray border-slate-gray/30", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with icon and title */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neon-cyan/10 rounded-md">
              <Icon className="h-4 w-4 text-neon-cyan" />
            </div>
            <p className="text-sm text-light-gray font-medium">{title}</p>
          </div>
          
          {/* Value */}
          <p className="text-2xl font-bold text-bright-white leading-none">
            {formatValue(value)}
          </p>
          
          {/* Change indicator */}
          {change && (
            <div className="flex items-center gap-2 text-sm">
              <span className={cn("flex items-center gap-1", getTrendColor())}>
                <span className="text-xs">{getTrendIcon()}</span>
                {Math.abs(change.value).toFixed(1)}%
              </span>
              <span className="text-xs text-light-gray">
                vs {change.period}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}