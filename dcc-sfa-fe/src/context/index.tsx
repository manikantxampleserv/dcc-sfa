import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ThemeContext from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const ContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        /**
         * @description Retry function that prevents retries on 403 (Forbidden) errors
         * @param {number} failureCount - Number of retry attempts
         * @param {Error} error - The error that occurred
         * @returns {boolean} True if should retry, false otherwise
         */
        retry: (failureCount, error: any) => {
          // Get status from multiple possible locations (AxiosError or ApiErrorClass)
          const status =
            error?.response?.status ||
            error?.statusCode ||
            error?.originalError?.response?.status ||
            (error?.originalError as any)?.statusCode;

          // Don't retry on 403 Forbidden errors (permission denied)
          if (status === 403) {
            return false;
          }
          // Don't retry on 401 Unauthorized errors (authentication required)
          if (status === 401) {
            return false;
          }
          // Don't retry on 4xx client errors (except network issues)
          if (status >= 400 && status < 500) {
            return false;
          }
          // Retry up to 3 times for server errors (5xx) and network errors
          return failureCount < 3;
        },
        /**
         * @description Prevent retrying on mount if query previously failed
         */
        retryOnMount: false,
      },
      mutations: {
        /**
         * @description Retry function for mutations that prevents retries on 403 (Forbidden) errors
         * @param {number} failureCount - Number of retry attempts
         * @param {Error} error - The error that occurred
         * @returns {boolean} True if should retry, false otherwise
         */
        retry: (failureCount, error: any) => {
          // Get status from multiple possible locations (AxiosError or ApiErrorClass)
          const status =
            error?.response?.status ||
            error?.statusCode ||
            error?.originalError?.response?.status;

          // Don't retry on 403 Forbidden errors (permission denied)
          if (status === 403) {
            return false;
          }
          // Don't retry on 401 Unauthorized errors (authentication required)
          if (status === 401) {
            return false;
          }
          // Don't retry on 4xx client errors
          if (status >= 400 && status < 500) {
            return false;
          }
          // Retry up to 1 time for server errors (5xx) and network errors
          return failureCount < 1;
        },
      },
    },
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeContext>
        <QueryClientProvider client={client}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </ThemeContext>
    </LocalizationProvider>
  );
};

export default ContextProvider;
