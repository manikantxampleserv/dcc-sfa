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
