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
    { value: 'all', label: 'All Clients' },
    { value: 'active', label: 'Active' },
    { value: 'frozen', label: 'Expired' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const filterChips = [
    { 
      key: 'all', 
      label: 'All', 
      active: !filters.status || filters.status === 'all',
      count: null
    },
    { 
      key: 'active', 
      label: 'Active', 
      active: filters.status === 'active',
      count: null
    },
    { 
      key: 'frozen', 
      label: 'Expired', 
      active: filters.status === 'frozen',
      count: null
    },
    { 
      key: 'expiring_soon', 
      label: 'Expiring Soon', 
      active: filters.expiring_soon === true,
      count: null
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stormy-weather" />
        <Input
          placeholder="Search clients by name..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-midnight-magic border-stormy-weather text-silver-setting placeholder:text-stormy-weather"
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
                ? "bg-coastal-vista/20 border-coastal-vista/30 text-coastal-vista hover:bg-coastal-vista/30"
                : "border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
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
          <SelectTrigger className="w-48 bg-midnight-magic border-stormy-weather text-silver-setting">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3" />
              <SelectValue placeholder="Filter by plan" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-midnight-magic border-stormy-weather">
            <SelectItem value="all" className="text-silver-setting">All Plans</SelectItem>
            {plans.map((plan) => (
              <SelectItem 
                key={plan.id} 
                value={plan.id}
                className="text-silver-setting hover:bg-stormy-weather/20"
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
            className="text-stormy-weather hover:text-silver-setting hover:bg-stormy-weather/10"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}