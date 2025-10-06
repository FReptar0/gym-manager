export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClientStatus = 'active' | 'frozen' | 'inactive';
export type PaymentMethod = 'cash' | 'transfer';

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string;
          name: string;
          duration_days: number;
          price: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          duration_days: number;
          price: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          duration_days?: number;
          price?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          photo_url: string | null;
          birth_date: string | null;
          blood_type: string | null;
          gender: string | null;
          medical_conditions: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          registration_date: string;
          current_plan_id: string | null;
          last_payment_date: string | null;
          expiration_date: string | null;
          status: ClientStatus;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email?: string | null;
          photo_url?: string | null;
          birth_date?: string | null;
          blood_type?: string | null;
          gender?: string | null;
          medical_conditions?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          registration_date?: string;
          current_plan_id?: string | null;
          last_payment_date?: string | null;
          expiration_date?: string | null;
          status?: ClientStatus;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          photo_url?: string | null;
          birth_date?: string | null;
          blood_type?: string | null;
          gender?: string | null;
          medical_conditions?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          registration_date?: string;
          current_plan_id?: string | null;
          last_payment_date?: string | null;
          expiration_date?: string | null;
          status?: ClientStatus;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          client_id: string;
          plan_id: string;
          amount: number;
          payment_method: PaymentMethod;
          payment_date: string;
          period_start: string;
          period_end: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          plan_id: string;
          amount: number;
          payment_method: PaymentMethod;
          payment_date?: string;
          period_start: string;
          period_end: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          plan_id?: string;
          amount?: number;
          payment_method?: PaymentMethod;
          payment_date?: string;
          period_start?: string;
          period_end?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      measurements: {
        Row: {
          id: string;
          client_id: string;
          measurement_date: string;
          weight: number | null;
          height: number | null;
          bmi: number | null;
          chest: number | null;
          waist: number | null;
          hips: number | null;
          arms: number | null;
          legs: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          measurement_date?: string;
          weight?: number | null;
          height?: number | null;
          chest?: number | null;
          waist?: number | null;
          hips?: number | null;
          arms?: number | null;
          legs?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          measurement_date?: string;
          weight?: number | null;
          height?: number | null;
          chest?: number | null;
          waist?: number | null;
          hips?: number | null;
          arms?: number | null;
          legs?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
