/**
 * Currency formatting utilities
 */

// Default currency configuration
const DEFAULT_CURRENCY = 'MXN'; // Mexican Peso
const DEFAULT_LOCALE = 'es-MX';

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number, 
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback to basic formatting
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Format currency without currency symbol (for inputs)
 */
export function formatCurrencyValue(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remove currency symbols, spaces, and commas
  const cleanString = currencyString.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleanString);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate currency amount
 */
export function isValidCurrencyAmount(amount: number): boolean {
  return !isNaN(amount) && amount >= 0 && amount <= 999999.99;
}

/**
 * Calculate percentage change between two amounts
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage change with appropriate styling
 */
export function formatPercentageChange(current: number, previous: number): {
  value: number;
  formatted: string;
  isPositive: boolean;
} {
  const change = calculatePercentageChange(current, previous);
  const isPositive = change >= 0;
  
  return {
    value: change,
    formatted: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
    isPositive
  };
}

/**
 * Calculate monthly equivalent for different plan durations
 */
export function calculateMonthlyEquivalent(price: number, durationDays: number): number {
  if (durationDays <= 0) return 0;
  
  // Standard conversions
  if (durationDays === 1) return 0; // Per class not included in projections
  if (durationDays === 7) return price * 4; // Weekly * 4 weeks
  if (durationDays === 30) return price; // Monthly as-is
  if (durationDays === 365) return price / 12; // Annual / 12 months
  
  // Custom duration: calculate daily rate and multiply by 30
  const dailyRate = price / durationDays;
  return dailyRate * 30;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) return 0;
  return ((originalPrice - discountedPrice) / originalPrice) * 100;
}

/**
 * Apply discount to price
 */
export function applyDiscount(price: number, discountPercentage: number): number {
  if (discountPercentage < 0 || discountPercentage > 100) return price;
  return price * (1 - discountPercentage / 100);
}