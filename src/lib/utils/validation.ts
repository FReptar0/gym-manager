import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

// Common validation patterns
const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Client validation schema
export const clientSchema = z.object({
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must not exceed 200 characters')
    .trim(),
  
  phone: z.string()
    .regex(phoneRegex, 'Phone must be exactly 10 digits')
    .transform(val => val.replace(/\D/g, '')), // Remove non-digits
  
  email: z.union([
    z.string().email('Invalid email format'),
    z.literal(''),
    z.undefined()
  ]).optional(),
  
  birth_date: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    z.literal(''),
    z.undefined()
  ]).optional(),
  
  blood_type: z.union([
    z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    z.literal(''),
    z.literal('not_specified'),
    z.undefined()
  ]).optional(),
  
  gender: z.union([
    z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
    z.literal(''),
    z.literal('not_specified'),
    z.undefined()
  ]).optional(),
  
  medical_conditions: z.string()
    .max(1000, 'Medical conditions must not exceed 1000 characters')
    .optional(),
  
  emergency_contact_name: z.string()
    .max(200, 'Emergency contact name must not exceed 200 characters')
    .optional(),
  
  emergency_contact_phone: z.union([
    z.string().regex(phoneRegex, 'Emergency contact phone must be exactly 10 digits'),
    z.literal(''),
    z.undefined()
  ]).optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Plan validation schema
export const planSchema = z.object({
  name: z.string()
    .min(2, 'Plan name must be at least 2 characters')
    .max(100, 'Plan name must not exceed 100 characters')
    .trim(),
  
  duration_days: z.number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 day')
    .max(1825, 'Duration must not exceed 5 years'), // 5 years max
  
  price: z.number()
    .min(0.01, 'Price must be greater than 0')
    .max(999999.99, 'Price must not exceed $999,999.99'),
  
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  
  is_active: z.boolean().default(true),
});

export type PlanFormData = z.infer<typeof planSchema>;

// Payment validation schema
export const paymentSchema = z.object({
  client_id: z.string()
    .uuid('Invalid client ID'),
  
  plan_id: z.string()
    .uuid('Invalid plan ID'),
  
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0')
    .max(999999.99, 'Amount must not exceed $999,999.99'),
  
  payment_method: z.enum(['cash', 'transfer'], {
    required_error: 'Payment method is required',
  }),
  
  payment_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Payment date must be in YYYY-MM-DD format'),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Measurement validation schema
export const measurementSchema = z.object({
  client_id: z.string()
    .uuid('Invalid client ID'),
  
  measurement_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Measurement date must be in YYYY-MM-DD format'),
  
  weight: z.number()
    .min(1, 'Weight must be at least 1 kg')
    .max(500, 'Weight must not exceed 500 kg')
    .optional(),
  
  height: z.number()
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must not exceed 300 cm')
    .optional(),
  
  chest: z.number()
    .min(20, 'Chest measurement must be at least 20 cm')
    .max(200, 'Chest measurement must not exceed 200 cm')
    .optional(),
  
  waist: z.number()
    .min(20, 'Waist measurement must be at least 20 cm')
    .max(200, 'Waist measurement must not exceed 200 cm')
    .optional(),
  
  hips: z.number()
    .min(20, 'Hips measurement must be at least 20 cm')
    .max(200, 'Hips measurement must not exceed 200 cm')
    .optional(),
  
  arms: z.number()
    .min(10, 'Arms measurement must be at least 10 cm')
    .max(100, 'Arms measurement must not exceed 100 cm')
    .optional(),
  
  legs: z.number()
    .min(20, 'Legs measurement must be at least 20 cm')
    .max(150, 'Legs measurement must not exceed 150 cm')
    .optional(),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
});

export type MeasurementFormData = z.infer<typeof measurementSchema>;

// Search and filter validation
export const clientFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'frozen', 'inactive']).default('all'),
  plan_id: z.string().uuid().optional(),
  expiring_soon: z.boolean().optional(),
});

export const paymentFiltersSchema = z.object({
  client_id: z.string().uuid().optional(),
  plan_id: z.string().uuid().optional(),
  payment_method: z.enum(['cash', 'transfer']).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  amount_min: z.number().min(0).optional(),
  amount_max: z.number().min(0).optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Utility functions for validation
 */

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  if (!phone || phone.length !== 10) return phone;
  
  // Format as (XXX) XXX-XXXX
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
}

// Clean phone number (remove formatting)
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Validate email format
export function isValidEmail(email: string): boolean {
  if (!email) return true; // Email is optional
  return emailRegex.test(email);
}

// Validate phone format
export function isValidPhone(phone: string): boolean {
  return phoneRegex.test(cleanPhoneNumber(phone));
}

// Validate date format and range
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  const minDate = new Date('1900-01-01');
  
  return date instanceof Date && 
         !isNaN(date.getTime()) && 
         date >= minDate && 
         date <= today;
}

// Validate future date (for appointments, etc.)
export function isValidFutureDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only
  
  return date instanceof Date && 
         !isNaN(date.getTime()) && 
         date >= today;
}

// File validation
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size must be less than 2MB' };
  }
  
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'File must be a JPEG, PNG, or WebP image' };
  }
  
  return { isValid: true };
}