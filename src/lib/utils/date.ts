import { 
  format, 
  isToday, 
  isTomorrow, 
  isYesterday, 
  differenceInDays, 
  addDays, 
  startOfMonth, 
  endOfMonth,
  parseISO,
  isValid
} from 'date-fns';

/**
 * Format a date string for display
 */
export function formatDate(dateString: string | null | undefined, formatStr: string = 'PPP'): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return format(date, formatStr);
  } catch {
    return '';
  }
}

/**
 * Format a date for form inputs (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/**
 * Get relative date description (Today, Tomorrow, etc.)
 */
export function getRelativeDateDescription(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    
    const daysDiff = differenceInDays(date, new Date());
    
    if (daysDiff > 0) {
      if (daysDiff <= 7) return `In ${daysDiff} days`;
      return formatDate(dateString, 'MMM d, yyyy');
    } else {
      if (daysDiff >= -7) return `${Math.abs(daysDiff)} days ago`;
      return formatDate(dateString, 'MMM d, yyyy');
    }
  } catch {
    return '';
  }
}

/**
 * Calculate expiration date based on start date and duration
 */
export function calculateExpirationDate(startDate: string, durationDays: number): string {
  try {
    const start = parseISO(startDate);
    if (!isValid(start)) throw new Error('Invalid start date');
    
    const expiration = addDays(start, durationDays - 1); // -1 because start date counts as day 1
    return format(expiration, 'yyyy-MM-dd');
  } catch (error) {
    throw new Error(`Failed to calculate expiration date: ${error}`);
  }
}

/**
 * Calculate period dates for payment
 */
export function calculatePaymentPeriod(
  paymentDate: string, 
  durationDays: number,
  lastPaymentDate?: string | null
): { period_start: string; period_end: string } {
  try {
    const payment = parseISO(paymentDate);
    if (!isValid(payment)) throw new Error('Invalid payment date');
    
    let periodStart: Date;
    
    if (lastPaymentDate) {
      const lastPayment = parseISO(lastPaymentDate);
      if (isValid(lastPayment)) {
        // If paying in advance, start from day after last expiration
        periodStart = addDays(lastPayment, 1);
      } else {
        periodStart = payment;
      }
    } else {
      periodStart = payment;
    }
    
    const periodEnd = addDays(periodStart, durationDays - 1);
    
    return {
      period_start: format(periodStart, 'yyyy-MM-dd'),
      period_end: format(periodEnd, 'yyyy-MM-dd')
    };
  } catch (error) {
    throw new Error(`Failed to calculate payment period: ${error}`);
  }
}

/**
 * Check if a membership is expiring soon (within next 3 days)
 */
export function isExpiringSoon(expirationDate: string | null | undefined, days: number = 3): boolean {
  if (!expirationDate) return false;
  
  try {
    const expiration = parseISO(expirationDate);
    if (!isValid(expiration)) return false;
    
    const today = new Date();
    const daysDiff = differenceInDays(expiration, today);
    
    return daysDiff >= 0 && daysDiff <= days;
  } catch {
    return false;
  }
}

/**
 * Check if a membership is expired
 */
export function isExpired(expirationDate: string | null | undefined): boolean {
  if (!expirationDate) return false;
  
  try {
    const expiration = parseISO(expirationDate);
    if (!isValid(expiration)) return false;
    
    const today = new Date();
    return differenceInDays(expiration, today) < 0;
  } catch {
    return false;
  }
}

/**
 * Get days until expiration (negative if expired)
 */
export function getDaysUntilExpiration(expirationDate: string | null | undefined): number {
  if (!expirationDate) return 0;
  
  try {
    const expiration = parseISO(expirationDate);
    if (!isValid(expiration)) return 0;
    
    return differenceInDays(expiration, new Date());
  } catch {
    return 0;
  }
}

/**
 * Get month date range for reports
 */
export function getMonthDateRange(year: number, month: number): { start: string; end: string } {
  const monthStart = startOfMonth(new Date(year, month - 1)); // month is 0-indexed
  const monthEnd = endOfMonth(new Date(year, month - 1));
  
  return {
    start: format(monthStart, 'yyyy-MM-dd'),
    end: format(monthEnd, 'yyyy-MM-dd')
  };
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Parse month string (YYYY-MM) to year and month numbers
 */
export function parseMonthString(monthString: string): { year: number; month: number } {
  const [year, month] = monthString.split('-').map(Number);
  return { year, month };
}