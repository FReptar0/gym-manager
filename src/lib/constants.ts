/**
 * Application constants
 */

// App configuration
export const APP_NAME = 'Gym Manager';
export const APP_DESCRIPTION = 'Neighborhood Gym Management System';

// File upload limits
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Client status options
export const CLIENT_STATUSES = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  INACTIVE: 'inactive',
} as const;

export const CLIENT_STATUS_LABELS = {
  [CLIENT_STATUSES.ACTIVE]: 'Activo',
  [CLIENT_STATUSES.FROZEN]: 'Vencido',
  [CLIENT_STATUSES.INACTIVE]: 'Inactivo',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Efectivo',
  [PAYMENT_METHODS.TRANSFER]: 'Transferencia',
} as const;

// Blood types
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decir' },
] as const;

// Plan durations (for quick selection)
export const COMMON_PLAN_DURATIONS = [
  { label: 'Diario', days: 1 },
  { label: 'Semanal', days: 7 },
  { label: 'Quincenal', days: 14 },
  { label: 'Mensual', days: 30 },
  { label: 'Trimestral', days: 90 },
  { label: 'Semestral', days: 180 },
  { label: 'Anual', days: 365 },
] as const;

// Alert thresholds
export const EXPIRATION_WARNING_DAYS = 3;
export const OVERDUE_ALERT_DAYS = 7;

// Guest client ID (for daily payments)
export const GUEST_CLIENT_ID = '00000000-0000-0000-0000-000000000001';

// API endpoints
export const API_ENDPOINTS = {
  CLIENTS: '/api/clients',
  PAYMENTS: '/api/payments',
  PLANS: '/api/plans',
  REPORTS: '/api/reports',
  MEASUREMENTS: '/api/measurements',
  AUTH: '/api/auth',
} as const;

// Date formats
export const DATE_FORMATS = {
  INPUT: 'yyyy-MM-dd',
  DISPLAY: 'MMM d, yyyy',
  FULL: 'PPPP',
  SHORT: 'MMM d',
  MONTH_YEAR: 'MMM yyyy',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Chart colors (dark mode optimized)
export const CHART_COLORS = {
  PRIMARY: '#00d9ff',       // neon-cyan
  SECONDARY: '#32ff7e',     // electric-lime
  SUCCESS: '#22c55e',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  MUTED: '#404040',         // slate-gray
} as const;

// Status badge configurations
export const STATUS_BADGE_CONFIG = {
  active: {
    color: 'green',
    icon: '🟢',
    label: 'Activo',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-400',
    borderClass: 'border-green-500/30',
    dotClass: 'bg-green-500',
  },
  frozen: {
    color: 'red',
    icon: '🔴',
    label: 'Vencido',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
    dotClass: 'bg-red-500',
  },
  expiring_soon: {
    color: 'yellow',
    icon: '🟡',
    label: 'Próximo a Vencer',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/30',
    dotClass: 'bg-yellow-500',
  },
  inactive: {
    color: 'gray',
    icon: '⚪',
    label: 'Inactivo',
    bgClass: 'bg-slate-gray/10',
    textClass: 'text-slate-gray',
    borderClass: 'border-slate-gray/30',
    dotClass: 'bg-slate-gray',
  },
} as const;

// Navigation items
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: 'Home' },
  { href: '/dashboard/clients', label: 'Clientes', icon: 'Users' },
  { href: '/dashboard/payments', label: 'Pagos', icon: 'DollarSign' },
  { href: '/dashboard/reports', label: 'Reportes', icon: 'BarChart3' },
] as const;

// Form field configurations
export const FORM_FIELD_CONFIGS = {
  CLIENT_NAME: {
    minLength: 2,
    maxLength: 200,
    placeholder: 'Ingresa el nombre completo',
  },
  PHONE: {
    length: 10,
    placeholder: '1234567890',
    pattern: '[0-9]{10}',
  },
  EMAIL: {
    placeholder: 'correo@ejemplo.com',
  },
  PLAN_NAME: {
    minLength: 2,
    maxLength: 100,
    placeholder: 'Ingresa el nombre del plan',
  },
  PRICE: {
    min: 0.01,
    max: 999999.99,
    step: 0.01,
    placeholder: '0.00',
  },
  DURATION: {
    min: 1,
    max: 1825, // 5 years
    placeholder: 'Días',
  },
} as const;

// Toast notification durations
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'gym-theme',
  USER_PREFERENCES: 'gym-user-preferences',
  RECENT_CLIENTS: 'gym-recent-clients',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Error de red. Por favor verifica tu conexión.',
  UNAUTHORIZED: 'No estás autorizado para realizar esta acción.',
  FORBIDDEN: 'Acceso denegado.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Ocurrió un error inesperado del servidor.',
  VALIDATION_ERROR: 'Por favor revisa el formulario por errores.',
  FILE_TOO_LARGE: 'El archivo debe ser menor a 2MB.',
  INVALID_FILE_TYPE: 'Solo se permiten imágenes JPEG, PNG y WebP.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CLIENT_CREATED: 'Cliente creado exitosamente',
  CLIENT_UPDATED: 'Cliente actualizado exitosamente',
  CLIENT_DELETED: 'Cliente eliminado exitosamente',
  PAYMENT_REGISTERED: 'Pago registrado exitosamente',
  PAYMENT_UPDATED: 'Pago actualizado exitosamente',
  PLAN_CREATED: 'Plan creado exitosamente',
  PLAN_UPDATED: 'Plan actualizado exitosamente',
  PLAN_DELETED: 'Plan desactivado exitosamente',
} as const;