import { Database, PaymentMethod } from './database';

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

// Re-export PaymentMethod for convenience
export type { PaymentMethod };

// Extended payment type with relationships
export interface PaymentWithDetails extends Payment {
  client: {
    id: string;
    full_name: string;
    phone: string;
    photo_url?: string | null;
  };
  plan: {
    id: string;
    name: string;
    duration_days: number;
    price: number;
  };
}

// Payment form data type
export interface PaymentFormData {
  client_id: string;
  plan_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  notes?: string;
}

// Payment calculation result
export interface PaymentCalculation {
  period_start: string;
  period_end: string;
  expiration_date: string;
  days_added: number;
}

// Payment filters
export interface PaymentFilters {
  client_id?: string;
  plan_id?: string;
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  client_search?: string;
}

// Revenue statistics
export interface RevenueStats {
  total_revenue: number;
  total_payments: number;
  revenue_by_method: {
    cash: number;
    transfer: number;
  };
  revenue_by_plan: Array<{
    plan_name: string;
    total_revenue: number;
    payment_count: number;
  }>;
  daily_revenue: Array<{
    date: string;
    revenue: number;
    payment_count: number;
  }>;
}