'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plan } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Edit, Power, PowerOff, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onToggleStatus: (plan: Plan) => void;
}

export function PlanCard({ plan, onEdit, onToggleStatus }: PlanCardProps) {
  const getDurationText = (days: number) => {
    if (days === 1) return '1 day';
    if (days === 7) return '1 week';
    if (days === 30) return '1 month';
    if (days === 365) return '1 year';
    if (days < 30) return `${days} days`;
    if (days < 365) {
      const months = Math.round(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.round(days / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  const getDailyRate = () => {
    return plan.price / plan.duration_days;
  };

  return (
    <Card className={cn(
      "bg-midnight-magic border-stormy-weather/30 transition-all duration-200",
      plan.is_active 
        ? "hover:border-coastal-vista/30" 
        : "opacity-60 border-stormy-weather/20"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-silver-setting">
                {plan.name}
              </h3>
              <Badge 
                className={cn(
                  plan.is_active
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-stormy-weather/10 text-stormy-weather border-stormy-weather/30"
                )}
              >
                {plan.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-coastal-vista" />
                <span className="text-2xl font-bold text-silver-setting">
                  {formatCurrency(plan.price)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-coastal-vista" />
                <span className="text-silver-setting">
                  {getDurationText(plan.duration_days)}
                </span>
                <span className="text-sm text-stormy-weather">
                  ({formatCurrency(getDailyRate())}/day)
                </span>
              </div>

              {plan.description && (
                <p className="text-sm text-stormy-weather mt-2">
                  {plan.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(plan)}
              className="border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(plan)}
              className={cn(
                "border-stormy-weather hover:bg-stormy-weather/10",
                plan.is_active
                  ? "text-red-400 hover:text-red-300"
                  : "text-green-400 hover:text-green-300"
              )}
            >
              {plan.is_active ? (
                <>
                  <PowerOff className="h-3 w-3 mr-1" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="h-3 w-3 mr-1" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-stormy-weather/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-stormy-weather">Value Score</p>
              <p className="text-sm font-medium text-silver-setting">
                {plan.duration_days >= 30 ? 'Excellent' : plan.duration_days >= 7 ? 'Good' : 'Basic'}
              </p>
            </div>
            <div>
              <p className="text-xs text-stormy-weather">Plan Type</p>
              <p className="text-sm font-medium text-silver-setting">
                {plan.duration_days === 1 ? 'Daily' : 
                 plan.duration_days === 7 ? 'Weekly' :
                 plan.duration_days === 30 ? 'Monthly' :
                 plan.duration_days === 365 ? 'Annual' : 'Custom'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}