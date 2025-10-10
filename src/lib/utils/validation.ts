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
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(200, 'Nombre no debe exceder 200 caracteres')
    .trim(),

  phone: z.string()
    .regex(phoneRegex, 'Teléfono debe tener exactamente 10 dígitos')
    .transform(val => val.replace(/\D/g, '')), // Remove non-digits

  email: z.union([
    z.string().email('Formato de correo inválido'),
    z.literal(''),
    z.undefined()
  ]).optional(),

  current_plan_id: z.string()
    .uuid('ID de plan inválido')
    .min(1, 'Debe seleccionar un plan'),

  birth_date: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD'),
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
    .max(1000, 'Condiciones médicas no deben exceder 1000 caracteres')
    .optional(),

  emergency_contact_name: z.string()
    .max(200, 'Nombre de contacto de emergencia no debe exceder 200 caracteres')
    .optional(),

  emergency_contact_phone: z.union([
    z.string().regex(phoneRegex, 'Teléfono de contacto de emergencia debe tener exactamente 10 dígitos'),
    z.literal(''),
    z.undefined()
  ]).optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Plan validation schema
export const planSchema = z.object({
  name: z.string()
    .min(2, 'El nombre del plan debe tener al menos 2 caracteres')
    .max(100, 'El nombre del plan no debe exceder 100 caracteres')
    .trim(),

  duration_days: z.number()
    .int('La duración debe ser un número entero')
    .min(1, 'La duración debe ser al menos 1 día')
    .max(1825, 'La duración no debe exceder 5 años'), // 5 years max

  price: z.number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .max(999999.99, 'El precio no debe exceder $999,999.99'),

  description: z.string()
    .max(500, 'La descripción no debe exceder 500 caracteres')
    .optional(),

  is_active: z.boolean().default(true),
});

export type PlanFormData = z.infer<typeof planSchema>;

// Payment validation schema
export const paymentSchema = z.object({
  client_id: z.string()
    .uuid('ID de cliente inválido'),

  plan_id: z.string()
    .uuid('ID de plan inválido'),

  amount: z.number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(999999.99, 'El monto no debe exceder $999,999.99'),

  payment_method: z.enum(['cash', 'transfer'], {
    required_error: 'El método de pago es requerido',
  }),

  payment_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de pago debe estar en formato YYYY-MM-DD'),

  notes: z.string()
    .max(500, 'Las notas no deben exceder 500 caracteres')
    .optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Measurement validation schema
export const measurementSchema = z.object({
  client_id: z.string()
    .uuid('ID de cliente inválido'),

  measurement_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de medición debe estar en formato YYYY-MM-DD'),

  weight: z.number()
    .min(1, 'El peso debe ser al menos 1 kg')
    .max(500, 'El peso no debe exceder 500 kg')
    .optional(),

  height: z.number()
    .min(50, 'La altura debe ser al menos 50 cm')
    .max(300, 'La altura no debe exceder 300 cm')
    .optional(),

  chest: z.number()
    .min(20, 'La medida del pecho debe ser al menos 20 cm')
    .max(200, 'La medida del pecho no debe exceder 200 cm')
    .optional(),

  waist: z.number()
    .min(20, 'La medida de la cintura debe ser al menos 20 cm')
    .max(200, 'La medida de la cintura no debe exceder 200 cm')
    .optional(),

  hips: z.number()
    .min(20, 'La medida de las caderas debe ser al menos 20 cm')
    .max(200, 'La medida de las caderas no debe exceder 200 cm')
    .optional(),

  arms: z.number()
    .min(10, 'La medida de los brazos debe ser al menos 10 cm')
    .max(100, 'La medida de los brazos no debe exceder 100 cm')
    .optional(),

  legs: z.number()
    .min(20, 'La medida de las piernas debe ser al menos 20 cm')
    .max(150, 'La medida de las piernas no debe exceder 150 cm')
    .optional(),

  notes: z.string()
    .max(500, 'Las notas no deben exceder 500 caracteres')
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
    return { isValid: false, error: 'El tamaño del archivo debe ser menor a 2MB' };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'El archivo debe ser una imagen JPEG, PNG o WebP' };
  }

  return { isValid: true };
}