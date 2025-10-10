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
    if (days === 1) return '1 día';
    if (days === 7) return '1 semana';
    if (days === 30) return '1 mes';
    if (days === 365) return '1 año';
    if (days < 30) return `${days} días`;
    if (days < 365) {
      const months = Math.round(days / 30);
      return `${months} mes${months > 1 ? 'es' : ''}`;
    }
    const years = Math.round(days / 365);
    return `${years} año${years > 1 ? 's' : ''}`;
  };

  const getDailyRate = () => {
    return plan.price / plan.duration_days;
  };

  return (
    <Card className={cn(
      "bg-carbon-gray border-slate-gray/30 transition-all duration-200",
      plan.is_active
        ? "hover:border-neon-cyan/30"
        : "opacity-60 border-slate-gray/20"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-bright-white">
                {plan.name}
              </h3>
              <Badge
                className={cn(
                  plan.is_active
                    ? "bg-electric-lime/10 text-electric-lime border-electric-lime/30"
                    : "bg-slate-gray/10 text-light-gray border-slate-gray/30"
                )}
              >
                {plan.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-neon-cyan flex-shrink-0" />
                <span className="text-2xl font-bold text-bright-white">
                  {formatCurrency(plan.price)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neon-cyan flex-shrink-0" />
                <span className="text-bright-white">
                  {getDurationText(plan.duration_days)}
                </span>
                <span className="text-sm text-light-gray flex-shrink-0">
                  ({formatCurrency(getDailyRate())}/día)
                </span>
              </div>

              {plan.description && (
                <p className="text-sm text-light-gray mt-2">
                  {plan.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(plan)}
              className="border-slate-gray text-light-gray hover:bg-slate-gray/10"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(plan)}
              className={cn(
                "border-slate-gray hover:bg-slate-gray/10",
                plan.is_active
                  ? "text-hot-orange hover:text-hot-orange/80"
                  : "text-electric-lime hover:text-electric-lime/80"
              )}
            >
              {plan.is_active ? (
                <>
                  <PowerOff className="h-3 w-3 mr-1" />
                  Desactivar
                </>
              ) : (
                <>
                  <Power className="h-3 w-3 mr-1" />
                  Activar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-slate-gray/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-light-gray">Puntuación de Valor</p>
              <p className="text-sm font-medium text-bright-white">
                {plan.duration_days >= 30 ? 'Excelente' : plan.duration_days >= 7 ? 'Bueno' : 'Básico'}
              </p>
            </div>
            <div>
              <p className="text-xs text-light-gray">Tipo de Plan</p>
              <p className="text-sm font-medium text-bright-white">
                {plan.duration_days === 1 ? 'Diario' :
                  plan.duration_days === 7 ? 'Semanal' :
                    plan.duration_days === 30 ? 'Mensual' :
                      plan.duration_days === 365 ? 'Anual' : 'Personalizado'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}