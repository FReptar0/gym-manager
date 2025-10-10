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
      alert('Error al actualizar estado del plan');
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
    { key: 'all', label: 'Todos los Planes', count: plans.length },
    { key: 'active', label: 'Activos', count: plans.filter(p => p.is_active).length },
    { key: 'inactive', label: 'Inactivos', count: plans.filter(p => !p.is_active).length },
  ];

  return (
    <div>
      <TopBar title="Planes" />

      <div className="p-4 space-y-4">
        {/* Filter Tabs */}
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-bright-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Planes de Membresía
              </h2>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plan
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
                      ? "bg-neon-cyan/20 border-neon-cyan/30 text-neon-cyan"
                      : "border-slate-gray text-light-gray hover:bg-slate-gray/10"
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
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-neon-cyan" />
              <p className="text-light-gray mt-2">Cargando planes...</p>
            </Card>
          ) : error ? (
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <p className="text-hot-orange">Error al cargar planes</p>
              <p className="text-sm text-light-gray/70 mt-2">{error}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="mt-3 border-slate-gray text-light-gray hover:bg-slate-gray/10"
              >
                Intentar de Nuevo
              </Button>
            </Card>
          ) : filteredPlans.length === 0 ? (
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <Settings className="h-12 w-12 mx-auto text-slate-gray/50 mb-4" />
              <p className="text-light-gray">
                {filter === 'all' 
                  ? 'No hay planes creados aún'
                  : `No se encontraron planes ${filter === 'active' ? 'activos' : 'inactivos'}`
                }
              </p>
              <p className="text-sm text-light-gray/70 mt-2">
                {filter === 'all'
                  ? 'Crea tu primer plan de membresía para comenzar'
                  : `Cambia a "Todos los Planes" para ver todos los planes`
                }
              </p>
              {filter === 'all' && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Plan
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
          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardContent className="p-4">
              <h3 className="text-bright-white font-medium mb-3">Estadísticas Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-neon-cyan">{plans.length}</p>
                  <p className="text-xs text-light-gray">Total de Planes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-electric-lime">
                    {plans.filter(p => p.is_active).length}
                  </p>
                  <p className="text-xs text-light-gray">Planes Activos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-bright-white">
                    ${Math.min(...plans.map(p => p.price)).toFixed(0)}
                  </p>
                  <p className="text-xs text-light-gray">Precio Más Bajo</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-bright-white">
                    ${Math.max(...plans.map(p => p.price)).toFixed(0)}
                  </p>
                  <p className="text-xs text-light-gray">Precio Más Alto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="bg-carbon-gray border-slate-gray/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-bright-white">Crear Nuevo Plan</DialogTitle>
          </DialogHeader>
          <PlanForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="bg-carbon-gray border-slate-gray/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-bright-white">Editar Plan</DialogTitle>
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
