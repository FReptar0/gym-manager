import { Database, ClientStatus } from './database';

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

// Re-export ClientStatus for convenience
export type { ClientStatus };

// Extended client type with relationships
export interface ClientWithPlan extends Client {
  plan?: {
    id: string;
    name: string;
    duration_days: number;
    price: number;
    description: string | null;
  } | null;
}

// Client form data type
export interface ClientFormData {
  full_name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  blood_type?: string;
  medical_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// Client filters
export interface ClientFilters {
  status?: ClientStatus | 'all';
  search?: string;
  plan_id?: string;
  expiring_soon?: boolean;
}

// Client statistics
export interface ClientStats {
  total: number;
  active: number;
  frozen: number;
  inactive: number;
  new_this_month: number;
  expiring_soon: number;
}