'use client';

import { useState, useEffect } from 'react';
import { DashboardStats, RevenueStats, APIResponse } from '@/types';
import { getCurrentMonth } from '@/lib/utils/date';

export function useDashboardStats(month?: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = month || getCurrentMonth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (currentMonth) params.set('month', currentMonth);

      const response = await fetch(`/api/reports/dashboard?${params.toString()}`);
      
      if (response.status === 401) {
        // User is not authenticated, redirect will be handled by middleware/auth hook
        throw new Error('Authentication required');
      }
      
      const result: APIResponse<DashboardStats> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard stats');
      }

      setStats(result.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentMonth]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

export function useRevenueStats(month?: string) {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = month || getCurrentMonth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (currentMonth) params.set('month', currentMonth);

      const response = await fetch(`/api/reports/revenue?${params.toString()}`);
      
      if (response.status === 401) {
        // User is not authenticated, redirect will be handled by middleware/auth hook
        throw new Error('Authentication required');
      }
      
      const result: APIResponse<RevenueStats> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch revenue stats');
      }

      setStats(result.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentMonth]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}