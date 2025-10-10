'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Client, 
  ClientWithPlan, 
  ClientFilters, 
  ClientStats, 
  PaginatedResponse,
  APIResponse 
} from '@/types';

interface UseClientsOptions {
  filters?: ClientFilters;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export function useClients(options: UseClientsOptions = {}) {
  const [clients, setClients] = useState<ClientWithPlan[]>([]);
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

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (options.filters?.search) params.set('search', options.filters.search);
      if (options.filters?.status) params.set('status', options.filters.status);
      if (options.filters?.plan_id) params.set('plan_id', options.filters.plan_id);
      if (options.filters?.expiring_soon) params.set('expiring_soon', 'true');
      if (options.page) params.set('page', options.page.toString());
      if (options.limit) params.set('limit', options.limit.toString());
      if (options.sort_by) params.set('sort_by', options.sort_by);
      if (options.sort_order) params.set('sort_order', options.sort_order);

      const response = await fetch(`/api/clients?${params.toString()}`);
      
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      
      const result: PaginatedResponse<ClientWithPlan> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch clients');
      }

      setClients(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [
    options.filters?.search,
    options.filters?.status,
    options.filters?.plan_id,
    options.filters?.expiring_soon,
    options.page,
    options.limit,
    options.sort_by,
    options.sort_order,
  ]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    pagination,
    refetch: fetchClients,
  };
}

export function useClient(id: string) {
  const [client, setClient] = useState<ClientWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${id}`);
      
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      
      const result: APIResponse<ClientWithPlan> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch client');
      }

      setClient(result.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return {
    client,
    loading,
    error,
    refetch: fetchClient,
  };
}

export function useClientStats() {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/clients/stats');
      
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      
      const result: APIResponse<ClientStats> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch client stats');
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
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

export function useClientMutations() {
  const supabase = createClient();

  const createClientRecord = async (data: Partial<Client>) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: APIResponse<Client> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create client');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: APIResponse<Client> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update client');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      const result: APIResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete client');
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const uploadClientPhoto = async (clientId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}-${Date.now()}.${fileExt}`;
      const filePath = `client-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('client-photos')
        .getPublicUrl(filePath);

      // Update client with photo URL
      await updateClient(clientId, { photo_url: data.publicUrl });

      return data.publicUrl;
    } catch (error) {
      throw error;
    }
  };

  return {
    createClient: createClientRecord,
    updateClient,
    deleteClient,
    uploadClientPhoto,
  };
}