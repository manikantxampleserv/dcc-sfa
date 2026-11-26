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
  return currency?.code || 'TZS';
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
    TZS: 'TZS',
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

  if (currencyCode === 'TZS' && !currencies.length) {
    return `TZS ${amount.toLocaleString()}`;
  }

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
 * Format currency in compact notation (K, M, B) for high amounts.
 * Formats values into readable abbreviations (e.g., TZS 27.3B, TZS 54.8M, TZS 52K).
 *
 * @param {number | null | undefined} amount Numeric amount to format.
 * @param {Currency[]} [currencies] Currencies list.
 * @param {number} [defaultCurrencyId] Default currency ID.
 * @returns {string} Formatted compact currency string.
 */
export const formatCompactCurrency = (
  amount: number | null | undefined,
  currencies: Currency[] = [],
  defaultCurrencyId: number = 1
): string => {
  const currencyCode = getCurrencyCode(currencies, defaultCurrencyId);
  const currencySymbol = getCurrencySymbol(currencyCode);

  const num = Number(amount) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  let formatted = '';
  if (abs >= 1e9) {
    formatted = (abs / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B';
  } else if (abs >= 1e6) {
    formatted = (abs / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  } else if (abs >= 1e3) {
    formatted = (abs / 1e3).toFixed(2).replace(/\.?0+$/, '') + 'K';
  } else {
    formatted = abs.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  return `${currencySymbol} ${sign}${formatted}`;
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
