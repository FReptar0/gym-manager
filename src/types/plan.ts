import { Database } from './database';

export type Plan = Database['public']['Tables']['plans']['Row'];
export type PlanInsert = Database['public']['Tables']['plans']['Insert'];
export type PlanUpdate = Database['public']['Tables']['plans']['Update'];

// Plan form data type
export interface PlanFormData {
  name: string;
  duration_days: number;
  price: number;
  description?: string;
  is_active?: boolean;
}

// Plan with usage statistics
export interface PlanWithStats extends Plan {
  active_clients_count: number;
  total_revenue: number;
  total_payments: number;
  last_payment_date?: string;
}

// Plan types enum for easier categorization
export enum PlanType {
  DAILY = 'daily',
  WEEKLY = 'weekly', 
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  CUSTOM = 'custom'
}

// Helper function type to categorize plans
export interface PlanCategory {
  type: PlanType;
  label: string;
  monthly_equivalent: number;
}

// Revenue projection calculation
export interface PlanProjection {
  plan_id: string;
  plan_name: string;
  active_clients: number;
  monthly_equivalent_per_client: number;
  total_monthly_projection: number;
}