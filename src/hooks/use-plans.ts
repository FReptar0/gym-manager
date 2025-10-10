'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plan, PlanWithStats, APIResponse } from '@/types';

interface UsePlansOptions {
  includeInactive?: boolean;
}

export function usePlans(options: UsePlansOptions = {}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.includeInactive) params.set('include_inactive', 'true');

      const response = await fetch(`/api/plans?${params.toString()}`);
      const result: APIResponse<Plan[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener planes');
      }

      setPlans(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [options.includeInactive]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
}

export function usePlan(id: string) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/plans/${id}`);
      const result: APIResponse<Plan> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener plan');
      }

      setPlan(result.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return {
    plan,
    loading,
    error,
    refetch: fetchPlan,
  };
}

export function usePlanMutations() {
  const createPlan = async (data: Partial<Plan>) => {
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: APIResponse<Plan> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear plan');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  };

  const updatePlan = async (id: string, data: Partial<Plan>) => {
    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: APIResponse<Plan> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar plan');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
      });

      const result: APIResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar plan');
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    createPlan,
    updatePlan,
    deletePlan,
  };
}