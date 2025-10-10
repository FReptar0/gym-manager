'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Payment, 
  PaymentWithDetails, 
  PaymentFilters, 
  RevenueStats,
  PaginatedResponse,
  APIResponse 
} from '@/types';

interface UsePaymentsOptions {
  filters?: PaymentFilters;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (options.filters?.client_id) params.set('client_id', options.filters.client_id);
      if (options.filters?.plan_id) params.set('plan_id', options.filters.plan_id);
      if (options.filters?.payment_method) params.set('payment_method', options.filters.payment_method);
      if (options.filters?.date_from) params.set('date_from', options.filters.date_from);
      if (options.filters?.date_to) params.set('date_to', options.filters.date_to);
      if (options.filters?.amount_min) params.set('amount_min', options.filters.amount_min.toString());
      if (options.filters?.amount_max) params.set('amount_max', options.filters.amount_max.toString());
      if (options.page) params.set('page', options.page.toString());
      if (options.limit) params.set('limit', options.limit.toString());
      if (options.sort_by) params.set('sort_by', options.sort_by);
      if (options.sort_order) params.set('sort_order', options.sort_order);

      const response = await fetch(`/api/payments?${params.toString()}`);
      const result: PaginatedResponse<PaymentWithDetails> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payments');
      }

      setPayments(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [
    options.filters?.client_id,
    options.filters?.plan_id,
    options.filters?.payment_method,
    options.filters?.date_from,
    options.filters?.date_to,
    options.filters?.amount_min,
    options.filters?.amount_max,
    options.page,
    options.limit,
    options.sort_by,
    options.sort_order,
  ]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
  };
}

export function useClientPayments(clientId: string) {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments?client_id=${clientId}&sort_by=payment_date&sort_order=desc`);
      const result: PaginatedResponse<PaymentWithDetails> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch client payments');
      }

      setPayments(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchClientPayments();
    }
  }, [clientId, fetchClientPayments]);

  return {
    payments,
    loading,
    error,
    refetch: fetchClientPayments,
  };
}

export function usePaymentMutations() {
  const createPayment = async (data: any) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: APIResponse<Payment> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register payment');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    createPayment,
    registerPayment: createPayment, // Alias for backward compatibility
  };
}