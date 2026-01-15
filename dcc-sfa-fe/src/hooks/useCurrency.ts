import { useCurrencyContext } from '../context/CurrencyContext';
import { getCurrencyCode, formatCurrency } from '../utils/currencyUtils';

/**
 * Hook for getting currency code directly
 */
export const useCurrencyCode = (): string => {
  const { currencies, defaultCurrencyId } = useCurrencyContext();
  return getCurrencyCode(currencies, defaultCurrencyId);
};

/**
 * Hook for dynamic currency formatting using context
 */
export const useCurrency = () => {
  const { currencies, defaultCurrencyId } = useCurrencyContext();

  return {
    formatCurrency: (amount: number, formattedValue?: string): string =>
      formatCurrency(amount, formattedValue, currencies, defaultCurrencyId),
    currencies,
    defaultCurrencyId,
  };
};
