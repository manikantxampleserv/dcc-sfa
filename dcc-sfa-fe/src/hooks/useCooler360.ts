import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchCooler360Data,
  type Cooler360Payload,
} from '../services/masters/Cooler360';

export type {
  Cooler360Payload,
  Cooler360Asset,
  Cooler360Photo,
  Cooler360Health,
  Cooler360HealthMetric,
  Cooler360Placement,
  Cooler360OpenTicket,
  Cooler360Activity,
  Cooler360DataCheck,
} from '../services/masters/Cooler360';

/**
 * Query keys for Cooler 360 data
 */
export const cooler360QueryKeys = {
  all: ['cooler-360'] as const,
  detail: (identifier?: string) =>
    [...cooler360QueryKeys.all, identifier || 'default'] as const,
};

/**
 * Hook to fetch unified Cooler 360 payload by identifier (barcode, id, serial number, code).
 *
 * @param {string} identifier Asset identifier.
 * @param {UseQueryOptions} options React Query options.
 * @returns Query result with complete Cooler 360 view data.
 */
export const useCooler360 = (
  identifier?: string,
  options?: Omit<
    UseQueryOptions<Cooler360Payload>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: cooler360QueryKeys.detail(identifier),
    queryFn: () => fetchCooler360Data(identifier),
    enabled: true,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

