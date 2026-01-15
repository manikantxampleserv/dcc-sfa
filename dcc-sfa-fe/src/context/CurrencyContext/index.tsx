import { useCurrencies } from 'hooks/useCurrencies';
import { useSettings } from 'hooks/useSettings';
import React, { createContext, useContext } from 'react';
import type { Currency } from 'utils/currencyUtils';

/**
 * Currency context interface
 */
interface CurrencyContextType {
  currencies: Currency[];
  defaultCurrencyId: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Currency context provider
 */
export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    data: currenciesResponse,
    isLoading: currenciesLoading,
    error: currenciesError,
  } = useCurrencies({ limit: 1000 });
  const {
    data: settingsResponse,
    isLoading: settingsLoading,
    error: settingsError,
  } = useSettings();

  const currencies = currenciesResponse?.data || [];
  const settings = settingsResponse?.data;
  const defaultCurrencyId = settings?.currency_id || 1;

  const contextValue: CurrencyContextType = {
    currencies,
    defaultCurrencyId,
    isLoading: currenciesLoading || settingsLoading,
    error: currenciesError?.message || settingsError?.message || null,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

/**
 * Currency context
 */
export const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

/**
 * Hook to use currency context
 */
export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error(
      'useCurrencyContext must be used within a CurrencyProvider'
    );
  }
  return context;
};
