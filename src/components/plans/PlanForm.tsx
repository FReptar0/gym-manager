'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { planSchema, PlanFormData } from '@/lib/utils/validation';
import { Plan } from '@/types';
import { usePlanMutations } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  Calculator,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface PlanFormProps {
  plan?: Plan;
  onSuccess: (plan: Plan) => void;
  onCancel: () => void;
}

const PRESET_PLANS = [
  { name: 'Daily Pass', duration_days: 1, price: 50, description: 'Single day access' },
  { name: 'Weekly', duration_days: 7, price: 150, description: 'Weekly membership' },
  { name: 'Monthly', duration_days: 30, price: 500, description: 'Monthly membership' },
  { name: 'Quarterly', duration_days: 90, price: 1350, description: '3-month membership (10% off)' },
  { name: 'Annual', duration_days: 365, price: 4800, description: 'Annual membership (20% off)' },
];

export function PlanForm({ plan, onSuccess, onCancel }: PlanFormProps) {
  const [loading, setLoading] = useState(false);
  const { createPlan, updatePlan } = usePlanMutations();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: plan ? {
      name: plan.name,
      duration_days: plan.duration_days,
      price: plan.price,
      description: plan.description || '',
    } : {
      duration_days: 30,
      price: 500,
    },
  });

  const watchedPrice = watch('price');
  const watchedDuration = watch('duration_days');

  const getDailyRate = () => {
    if (watchedPrice && watchedDuration) {
      return watchedPrice / watchedDuration;
    }
    return 0;
  };

  const getMonthlyEquivalent = () => {
    if (watchedPrice && watchedDuration) {
      if (watchedDuration === 7) return watchedPrice * 4;
      if (watchedDuration === 30) return watchedPrice;
      if (watchedDuration === 365) return watchedPrice / 12;
      return (watchedPrice / watchedDuration) * 30;
    }
    return 0;
  };

  const getSavingsText = () => {
    const dailyRate = getDailyRate();
    const standardDaily = 50; // Reference daily rate
    
    if (dailyRate < standardDaily) {
      const savings = ((standardDaily - dailyRate) / standardDaily) * 100;
      return `${savings.toFixed(0)}% savings vs daily rate`;
    }
    return null;
  };

  const handlePresetSelect = (preset: typeof PRESET_PLANS[0]) => {
    setValue('name', preset.name);
    setValue('duration_days', preset.duration_days);
    setValue('price', preset.price);
    setValue('description', preset.description);
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      setLoading(true);
      
      let savedPlan: Plan;
      
      if (plan) {
        savedPlan = (await updatePlan(plan.id, data)) as Plan;
      } else {
        savedPlan = (await createPlan(data)) as Plan;
      }

      onSuccess(savedPlan);
    } catch (error) {
      console.error('Error saving plan:', error);
      alert(error instanceof Error ? error.message : 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Preset Plans */}
      {!plan && (
        <Card className="bg-midnight-magic border-stormy-weather/30">
          <CardHeader>
            <CardTitle className="text-silver-setting flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESET_PLANS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="p-3 text-left bg-black-beauty border border-stormy-weather/30 rounded-lg hover:border-coastal-vista/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-silver-setting font-medium">{preset.name}</p>
                      <p className="text-xs text-stormy-weather">{preset.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-coastal-vista font-medium">
                        {formatCurrency(preset.price)}
                      </p>
                      <p className="text-xs text-stormy-weather">
                        {preset.duration_days} day{preset.duration_days > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card className="bg-midnight-magic border-stormy-weather/30">
        <CardHeader>
          <CardTitle className="text-silver-setting flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-silver-setting">
              Plan Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              className="bg-black-beauty border-stormy-weather text-silver-setting"
              placeholder="e.g., Monthly Premium"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration_days" className="text-silver-setting">
                Duration (Days) <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stormy-weather" />
                <Input
                  id="duration_days"
                  type="number"
                  min="1"
                  {...register('duration_days', { valueAsNumber: true })}
                  className="pl-10 bg-black-beauty border-stormy-weather text-silver-setting"
                  placeholder="30"
                />
              </div>
              {errors.duration_days && (
                <p className="text-red-400 text-sm mt-1">{errors.duration_days.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price" className="text-silver-setting">
                Price <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stormy-weather" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { valueAsNumber: true })}
                  className="pl-10 bg-black-beauty border-stormy-weather text-silver-setting"
                  placeholder="500.00"
                />
              </div>
              {errors.price && (
                <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-silver-setting">
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="bg-black-beauty border-stormy-weather text-silver-setting"
              placeholder="Brief description of what this plan includes..."
              rows={3}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Analysis */}
      {watchedPrice && watchedDuration && (
        <Card className="bg-midnight-magic border-stormy-weather/30">
          <CardHeader>
            <CardTitle className="text-silver-setting flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Pricing Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-black-beauty rounded-lg">
                <p className="text-xs text-stormy-weather">Daily Rate</p>
                <p className="text-lg font-semibold text-silver-setting">
                  {formatCurrency(getDailyRate())}
                </p>
              </div>
              
              <div className="text-center p-3 bg-black-beauty rounded-lg">
                <p className="text-xs text-stormy-weather">Monthly Equivalent</p>
                <p className="text-lg font-semibold text-silver-setting">
                  {formatCurrency(getMonthlyEquivalent())}
                </p>
              </div>

              <div className="text-center p-3 bg-black-beauty rounded-lg col-span-2 md:col-span-1">
                <p className="text-xs text-stormy-weather">Duration</p>
                <p className="text-lg font-semibold text-silver-setting">
                  {watchedDuration} day{watchedDuration > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {getSavingsText() && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <p className="text-green-400 text-sm font-medium">
                    {getSavingsText()}
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs text-stormy-weather space-y-1">
              <p>• Daily rate comparison based on $50/day standard</p>
              <p>• Monthly equivalent helps compare different plan durations</p>
              <p>• Longer plans typically offer better value per day</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty"
          disabled={loading}
        >
          {loading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}