import { useCurrencyContext } from '../context/CurrencyContext';
import {
  getCurrencyCode,
  formatCurrency,
  formatCompactCurrency,
} from '../utils/currencyUtils';

/**
 * Hook for getting currency code directly
 * @returns {string} Currency code
 */
export const useCurrencyCode = (): string => {
  const { currencies, defaultCurrencyId } = useCurrencyContext();
  return getCurrencyCode(currencies, defaultCurrencyId);
};

/**
 * Hook for dynamic currency formatting using context
 * @returns Currency helper functions and metadata
 */
export const useCurrency = () => {
  const { currencies, defaultCurrencyId } = useCurrencyContext();

  return {
    formatCurrency: (
      amount: number | null | undefined,
      formattedValue?: string
    ): string =>
      amount === null || amount === undefined
        ? 'N/A'
        : formatCurrency(Number(amount), formattedValue, currencies, defaultCurrencyId),
    formatCompactCurrency: (amount: number | null | undefined): string =>
      amount === null || amount === undefined
        ? 'N/A'
        : formatCompactCurrency(amount, currencies, defaultCurrencyId),
    currencies,
    defaultCurrencyId,
  };
};
