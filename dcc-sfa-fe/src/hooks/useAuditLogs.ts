import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchAuditLogs,
  type AuditLogFilters,
  type AuditLogsResponse,
} from '../services/auditLogs';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters?: AuditLogFilters) =>
    [...auditLogKeys.lists(), filters] as const,
};

/**
 * Hook to fetch Audit Logs Data
 */
export const useAuditLogs = (
  filters?: AuditLogFilters,
  options?: Omit<UseQueryOptions<AuditLogsResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<AuditLogsResponse>({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 3 * 60 * 1000,
    ...options,
  });
};
