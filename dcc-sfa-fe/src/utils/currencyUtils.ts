/**
 * Currency utility functions for dynamic currency formatting
 */

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol?: string | null;
  exchange_rate_to_base?: number | null;
  is_base: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
}

/**
 * Get currency code from currency ID
 */
export const getCurrencyCode = (
  currencies: Currency[],
  currencyId: number
): string => {
  const currency = currencies.find(c => c.id === currencyId);
  return currency?.code || 'USD';
};

/**
 * Get currency symbol from currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
  };
  return symbols[currencyCode] || currencyCode;
};

/**
 * Format currency dynamically based on currency settings
 * Handles both API formatted values and raw amounts
 */
export const formatCurrency = (
  amount: number,
  formattedValue?: string,
  currencies: Currency[] = [],
  defaultCurrencyId: number = 1
): string => {
  const currencyCode = getCurrencyCode(currencies, defaultCurrencyId);
  const currencySymbol = getCurrencySymbol(currencyCode);

  if (formattedValue) {
    return formattedValue.replace(/[₹$€£¥]|[A-Z]{2,3}/g, match => {
      if (match.length >= 2) {
        return `${currencySymbol} `;
      }
      return `${currencySymbol} `;
    });
  }

  if (currencyCode === 'INR') {
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `${currencySymbol} ${lakhs.toFixed(1)}L`;
    }
    return `${currencySymbol} ${amount.toLocaleString('en-IN')}`;
  }

  return `${currencySymbol} ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)}`;
};

/**
 * Format currency with decimal places
 */
export const formatCurrencyWithDecimals = (
  amount: number,
  currencies: Currency[] = [],
  defaultCurrencyId: number = 1
): string => {
  const currencyCode = getCurrencyCode(currencies, defaultCurrencyId);
  const currencySymbol = getCurrencySymbol(currencyCode);

  if (currencyCode === 'INR') {
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `${currencySymbol} ${lakhs.toFixed(1)}L`;
    }
    return `${currencySymbol} ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};
