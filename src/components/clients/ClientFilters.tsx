'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientFilters } from '@/types';
import { Search, Filter } from 'lucide-react';
import { usePlans } from '@/hooks';
import { cn } from '@/lib/utils';

interface ClientFiltersProps {
  filters: ClientFilters;
  onFiltersChange: (filters: ClientFilters) => void;
}

export function ClientFiltersComponent({ filters, onFiltersChange }: ClientFiltersProps) {
  const { plans } = usePlans();

  const statusOptions = [
    { value: 'all', label: 'Todos los Clientes' },
    { value: 'active', label: 'Activos' },
    { value: 'frozen', label: 'Expirados' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  const filterChips = [
    { 
      key: 'all', 
      label: 'Todos', 
      active: !filters.status || filters.status === 'all',
      count: null
    },
    { 
      key: 'active', 
      label: 'Activos', 
      active: filters.status === 'active',
      count: null
    },
    { 
      key: 'frozen', 
      label: 'Expirados', 
      active: filters.status === 'frozen',
      count: null
    },
    { 
      key: 'expiring_soon', 
      label: 'Por Vencer', 
      active: filters.expiring_soon === true,
      count: null
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-gray" />
        <Input
          placeholder="Buscar clientes por nombre..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-steel-gray border-slate-gray text-bright-white placeholder:text-light-gray"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterChips.map((chip) => (
          <Button
            key={chip.key}
            variant="outline"
            size="sm"
            onClick={() => {
              if (chip.key === 'all') {
                onFiltersChange({ ...filters, status: 'all', expiring_soon: undefined });
              } else if (chip.key === 'expiring_soon') {
                onFiltersChange({ ...filters, expiring_soon: !filters.expiring_soon, status: 'active' });
              } else {
                onFiltersChange({ ...filters, status: chip.key as any, expiring_soon: undefined });
              }
            }}
            className={cn(
              "shrink-0 transition-colors",
              chip.active
                ? "bg-neon-cyan/20 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/30"
                : "border-slate-gray text-light-gray hover:bg-slate-gray/20"
            )}
          >
            {chip.label}
            {chip.count !== null && (
              <span className="ml-1 px-1 py-0.5 bg-current/20 rounded text-xs">
                {chip.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="flex gap-2 overflow-x-auto">
        <Select
          value={filters.plan_id || 'all'}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, plan_id: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-48 bg-steel-gray border-slate-gray text-bright-white">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3" />
              <SelectValue placeholder="Filtrar por plan" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-carbon-gray border-slate-gray">
            <SelectItem value="all" className="text-bright-white">Todos los Planes</SelectItem>
            {plans.map((plan) => (
              <SelectItem 
                key={plan.id} 
                value={plan.id}
                className="text-bright-white hover:bg-slate-gray/20"
              >
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filters.search || filters.status !== 'all' || filters.plan_id || filters.expiring_soon) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ status: 'all' })}
            className="text-light-gray hover:text-bright-white hover:bg-slate-gray/20"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}