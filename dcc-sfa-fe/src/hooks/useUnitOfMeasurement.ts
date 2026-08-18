/**
 * @fileoverview Unit of Measurement Management Hooks with React Query and Toast Integration
 * @description Provides hooks for Unit of Measurement CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as unitOfMeasurementService from '../services/masters/UnitOfMeasurement';

export type {
  UnitOfMeasurement,
  ManageUnitOfMeasurementPayload,
  UpdateUnitOfMeasurementPayload,
  GetUnitOfMeasurementParams,
} from '../services/masters/UnitOfMeasurement';

/**
 * Query keys for Unit of Measurement-related queries
 */
export const unitOfMeasurementQueryKeys = {
  all: ['unit-of-measurement'] as const,
  lists: () => [...unitOfMeasurementQueryKeys.all, 'list'] as const,
  list: (params?: any) =>
    [...unitOfMeasurementQueryKeys.lists(), params] as const,
  details: () => [...unitOfMeasurementQueryKeys.all, 'detail'] as const,
  detail: (id: number) =>
    [...unitOfMeasurementQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch Unit of Measurement with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with Unit of Measurement data
 */
export const useUnitOfMeasurement = (
  params?: unitOfMeasurementService.GetUnitOfMeasurementParams,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: unitOfMeasurementQueryKeys.list(params),
    queryFn: () => unitOfMeasurementService.fetchUnitOfMeasurement(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch Unit of Measurement by ID
 * @param id - Unit of Measurement ID
 * @param options - React Query options
 * @returns Query result with Unit of Measurement data
 */
export const useUnitOfMeasurementById = (
  id: number,
  options?: Omit<
    UseQueryOptions<unitOfMeasurementService.UnitOfMeasurement>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: unitOfMeasurementQueryKeys.detail(id),
    queryFn: () => unitOfMeasurementService.fetchUnitOfMeasurementById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create Unit of Measurement with automatic toast notifications
 * @returns Mutation object for creating Unit of Measurement
 */
export const useCreateUnitOfMeasurement = () => {
  return useApiMutation({
    mutationFn: unitOfMeasurementService.createUnitOfMeasurement,
    invalidateQueries: ['unit-of-measurement'],
    loadingMessage: 'Creating unit of measurement...',
  });
};

/**
 * Hook to update Unit of Measurement with automatic toast notifications
 * @returns Mutation object for updating Unit of Measurement
 */
export const useUpdateUnitOfMeasurement = () => {
  return useApiMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: unitOfMeasurementService.UpdateUnitOfMeasurementPayload;
    }) => unitOfMeasurementService.updateUnitOfMeasurement(id, data),
    invalidateQueries: ['unit-of-measurement'],
    loadingMessage: 'Updating unit of measurement...',
  });
};

/**
 * Hook to delete Unit of Measurement with automatic toast notifications
 * @returns Mutation object for deleting Unit of Measurement
 */
export const useDeleteUnitOfMeasurement = () => {
  return useApiMutation({
    mutationFn: unitOfMeasurementService.deleteUnitOfMeasurement,
    invalidateQueries: ['unit-of-measurement'],
    loadingMessage: 'Deleting unit of measurement...',
  });
};

/**
 * Hook that resolves the primary (case) and secondary (piece) UOM labels
 * from the UOM master data and applies standard abbreviations:
 *  - "case/crate" → "Cs"
 *  - "bottle(s)"  → "Btls"
 *
 * This is the single source of truth for UOM display labels across the app.
 *
 * @returns { uomCase, uomPcs } — abbreviated display labels ready for rendering.
 */
export const useResolvedUom = () => {
  const { data: uomData } = useUnitOfMeasurement({ limit: 1000 });

  const resolved = (() => {
    const data = uomData?.data || [];

    const primary =
      data.find((u: any) => u.sub_unit) ||
      data.find(
        (u: any) =>
          u.name?.toLowerCase().includes('case') ||
          u.name?.toLowerCase().includes('crate')
      ) ||
      data[0];

    const secondaryList = ['pcs', 'pieces', 'bottles', 'units', 'each'];
    const secondary =
      data.find((u: any) =>
        secondaryList.some(s => u.name?.toLowerCase().includes(s))
      ) || data.find((u: any) => u?.id !== primary?.id);

    let uomCase =
      primary?.name || import.meta.env.VITE_DEFAULT_UOM_CASE || 'Cases';
    let uomPcs =
      primary?.sub_unit ||
      secondary?.name ||
      import.meta.env.VITE_DEFAULT_UOM_PCS ||
      'PCs';

    const resolveForProduct = (product: any) => {
      if (!product) return { uomCase, uomPcs };

      const productUom =
        product.product_unit_of_measurement ||
        product.unit_of_measurement_data ||
        (product.unit_of_measurement &&
        typeof product.unit_of_measurement === 'object'
          ? product.unit_of_measurement
          : null);

      if (productUom) {
        return {
          uomCase: productUom.name || uomCase,
          uomPcs: productUom.sub_unit || uomPcs,
        };
      }

      const uomId =
        typeof product.unit_of_measurement === 'number'
          ? product.unit_of_measurement
          : product.unit_id;

      if (uomId && data.length > 0) {
        const found = data.find((u: any) => u.id === uomId);
        if (found) {
          return {
            uomCase: found.name || uomCase,
            uomPcs: found.sub_unit || uomPcs,
          };
        }
      }
      if (uomCase.toLowerCase().includes('crate')) uomCase = 'Cs';
      if (uomPcs.toLowerCase().includes('bottle')) uomPcs = 'Btls';
      return { uomCase, uomPcs };
    };
    if (uomCase.toLowerCase().includes('crate')) uomCase = 'Cs';
    if (uomPcs.toLowerCase().includes('bottle')) uomPcs = 'Btls';
    return { uomCase, uomPcs, resolveForProduct };
  })();

  return resolved;
};
