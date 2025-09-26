import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ThemeContext from './ThemeContext';

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
    <ThemeContext>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeContext>
  );
};

export default ContextProvider;
