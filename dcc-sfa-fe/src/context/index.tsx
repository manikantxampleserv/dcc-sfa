import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const ContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
      },
    },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default ContextProvider;
