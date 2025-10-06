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
  [CLIENT_STATUSES.ACTIVE]: 'Active',
  [CLIENT_STATUSES.FROZEN]: 'Expired',
  [CLIENT_STATUSES.INACTIVE]: 'Inactive',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.TRANSFER]: 'Transfer',
} as const;

// Blood types
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// Plan durations (for quick selection)
export const COMMON_PLAN_DURATIONS = [
  { label: 'Daily', days: 1 },
  { label: 'Weekly', days: 7 },
  { label: 'Bi-weekly', days: 14 },
  { label: 'Monthly', days: 30 },
  { label: 'Quarterly', days: 90 },
  { label: 'Semi-annual', days: 180 },
  { label: 'Annual', days: 365 },
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
  PRIMARY: '#8194a1',       // coastal-vista
  SECONDARY: '#c3af9f',     // frontier-fort
  SUCCESS: '#22c55e',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  MUTED: '#657079',         // stormy-weather
} as const;

// Status badge configurations
export const STATUS_BADGE_CONFIG = {
  active: {
    color: 'green',
    icon: '🟢',
    label: 'Active',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-400',
    borderClass: 'border-green-500/30',
    dotClass: 'bg-green-500',
  },
  frozen: {
    color: 'red',
    icon: '🔴',
    label: 'Expired',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
    dotClass: 'bg-red-500',
  },
  expiring_soon: {
    color: 'yellow',
    icon: '🟡',
    label: 'Expiring Soon',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/30',
    dotClass: 'bg-yellow-500',
  },
  inactive: {
    color: 'gray',
    icon: '⚪',
    label: 'Inactive',
    bgClass: 'bg-stormy-weather/10',
    textClass: 'text-stormy-weather',
    borderClass: 'border-stormy-weather/30',
    dotClass: 'bg-stormy-weather',
  },
} as const;

// Navigation items
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: 'Home' },
  { href: '/dashboard/clients', label: 'Clients', icon: 'Users' },
  { href: '/dashboard/payments', label: 'Payments', icon: 'DollarSign' },
  { href: '/dashboard/reports', label: 'Reports', icon: 'BarChart3' },
] as const;

// Form field configurations
export const FORM_FIELD_CONFIGS = {
  CLIENT_NAME: {
    minLength: 2,
    maxLength: 200,
    placeholder: 'Enter full name',
  },
  PHONE: {
    length: 10,
    placeholder: '1234567890',
    pattern: '[0-9]{10}',
  },
  EMAIL: {
    placeholder: 'email@example.com',
  },
  PLAN_NAME: {
    minLength: 2,
    maxLength: 100,
    placeholder: 'Enter plan name',
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
    placeholder: 'Days',
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
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred.',
  VALIDATION_ERROR: 'Please check the form for errors.',
  FILE_TOO_LARGE: 'File size must be less than 2MB.',
  INVALID_FILE_TYPE: 'Only JPEG, PNG, and WebP images are allowed.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CLIENT_CREATED: 'Client created successfully',
  CLIENT_UPDATED: 'Client updated successfully',
  CLIENT_DELETED: 'Client deleted successfully',
  PAYMENT_REGISTERED: 'Payment registered successfully',
  PAYMENT_UPDATED: 'Payment updated successfully',
  PLAN_CREATED: 'Plan created successfully',
  PLAN_UPDATED: 'Plan updated successfully',
  PLAN_DELETED: 'Plan deactivated successfully',
} as const;