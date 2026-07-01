import { useQuery } from '@tanstack/react-query';
import { fetchErrorLogs, type ErrorLogFilters } from '../services/errorLogs';

export const useErrorLogs = (
  filters?: ErrorLogFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['error-logs', filters],
    queryFn: () => fetchErrorLogs(filters),
    enabled: options?.enabled ?? true,
  });
};
