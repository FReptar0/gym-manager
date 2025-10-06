'use client';

import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlanCard } from '@/components/plans/PlanCard';
import { PlanForm } from '@/components/plans/PlanForm';
import { usePlans, usePlanMutations } from '@/hooks';
import { Plan } from '@/types';
import { Plus, Loader2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlansPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { plans, loading, error, refetch } = usePlans();
  const { updatePlan } = usePlanMutations();

  const filteredPlans = plans.filter(plan => {
    if (filter === 'active') return plan.is_active;
    if (filter === 'inactive') return !plan.is_active;
    return true;
  });

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      await updatePlan(plan.id, { is_active: !plan.is_active });
      refetch();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      alert('Failed to update plan status');
    }
  };

  const handleFormSuccess = (plan: Plan) => {
    setShowCreateForm(false);
    setEditingPlan(null);
    refetch();
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setEditingPlan(null);
  };

  const filterButtons = [
    { key: 'all', label: 'All Plans', count: plans.length },
    { key: 'active', label: 'Active', count: plans.filter(p => p.is_active).length },
    { key: 'inactive', label: 'Inactive', count: plans.filter(p => !p.is_active).length },
  ];

  return (
    <div>
      <TopBar title="Plans" />

      <div className="p-4 space-y-4">
        {/* Filter Tabs */}
        <Card className="bg-midnight-magic border-stormy-weather/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-silver-setting flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Membership Plans
              </h2>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {filterButtons.map((btn) => (
                <Button
                  key={btn.key}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter(btn.key as any)}
                  className={cn(
                    "shrink-0 transition-colors",
                    filter === btn.key
                      ? "bg-coastal-vista/20 border-coastal-vista/30 text-coastal-vista"
                      : "border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
                  )}
                >
                  {btn.label}
                  <span className="ml-1 px-1 py-0.5 bg-current/20 rounded text-xs">
                    {btn.count}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plans List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="bg-midnight-magic border-stormy-weather/30 p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-coastal-vista" />
              <p className="text-stormy-weather mt-2">Loading plans...</p>
            </Card>
          ) : error ? (
            <Card className="bg-midnight-magic border-stormy-weather/30 p-8 text-center">
              <p className="text-red-400">Error loading plans</p>
              <p className="text-sm text-stormy-weather/70 mt-2">{error}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="mt-3 border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
              >
                Try Again
              </Button>
            </Card>
          ) : filteredPlans.length === 0 ? (
            <Card className="bg-midnight-magic border-stormy-weather/30 p-8 text-center">
              <Settings className="h-12 w-12 mx-auto text-stormy-weather/50 mb-4" />
              <p className="text-stormy-weather">
                {filter === 'all' 
                  ? 'No plans created yet'
                  : `No ${filter} plans found`
                }
              </p>
              <p className="text-sm text-stormy-weather/70 mt-2">
                {filter === 'all'
                  ? 'Create your first membership plan to get started'
                  : `Switch to "All Plans" to see all plans`
                }
              </p>
              {filter === 'all' && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Plan
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </div>

        {/* Plan Statistics */}
        {plans.length > 0 && (
          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardContent className="p-4">
              <h3 className="text-silver-setting font-medium mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-coastal-vista">{plans.length}</p>
                  <p className="text-xs text-stormy-weather">Total Plans</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {plans.filter(p => p.is_active).length}
                  </p>
                  <p className="text-xs text-stormy-weather">Active Plans</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-silver-setting">
                    ${Math.min(...plans.map(p => p.price)).toFixed(0)}
                  </p>
                  <p className="text-xs text-stormy-weather">Lowest Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-silver-setting">
                    ${Math.max(...plans.map(p => p.price)).toFixed(0)}
                  </p>
                  <p className="text-xs text-stormy-weather">Highest Price</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="bg-midnight-magic border-stormy-weather/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-silver-setting">Create New Plan</DialogTitle>
          </DialogHeader>
          <PlanForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="bg-midnight-magic border-stormy-weather/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-silver-setting">Edit Plan</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <PlanForm
              plan={editingPlan}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
