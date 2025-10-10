export * from './database';
export * from './client';
export * from './payment';
export * from './plan';

// Common types
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  error?: string;
}

// Dashboard types
export interface DashboardStats {
  total_revenue: number;
  projected_revenue: number;
  active_clients: number;
  new_clients_this_month: number;
  churned_clients: number;
  revenue_growth_percentage: number;
  client_growth_percentage: number;
}

export interface TodayStats {
  todays_revenue: number;
  todays_payments: number;
  todays_registrations: number;
}

export interface DashboardAlert {
  type: 'expiring_today' | 'expiring_soon' | 'overdue';
  count: number;
  clients?: Array<{
    id: string;
    full_name: string;
    expiration_date: string;
    days_until_expiration: number;
  }>;
}

// Legacy types for backward compatibility
export interface DashboardMetrics {
  totalRevenue: number;
  projectedRevenue: number;
  activeClients: number;
  newClients: number;
  churnedClients: number;
  growthPercentage: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface PlanRevenue {
  planName: string;
  paymentCount: number;
  totalRevenue: number;
}
