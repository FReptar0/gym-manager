import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export utility functions
export { formatCurrency } from './utils/currency';
export { 
  formatDate, 
  getRelativeDateDescription as formatDateRelative,
  calculateExpirationDate,
  calculatePaymentPeriod,
  isExpiringSoon,
  isExpired,
  getDaysUntilExpiration,
  getMonthDateRange,
  getCurrentMonth,
  parseMonthString
} from './utils/date';

// Re-export addDays from date-fns directly
export { addDays } from 'date-fns';
