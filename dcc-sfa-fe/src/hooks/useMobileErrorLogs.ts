import { useQuery } from '@tanstack/react-query';
import {
  fetchMobileErrorLogs,
  type MobileErrorLogFilters,
} from '../services/mobileErrorLogs';

export const useMobileErrorLogs = (
  filters?: MobileErrorLogFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['mobile-error-logs', filters],
    queryFn: () => fetchMobileErrorLogs(filters),
    enabled: options?.enabled ?? true,
    refetchInterval: 30000,
  });
};
