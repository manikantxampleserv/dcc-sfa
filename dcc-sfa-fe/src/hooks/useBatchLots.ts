import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  batchLotsService,
  type BatchLot,
  type BatchLotDropdown,
  type BatchLotsQueryParams,
  type BatchLotsResponse,
  type CreateBatchLotRequest,
  type UpdateBatchLotRequest,
} from 'services/masters/BatchLots';

export type {
  BatchLot,
  BatchLotDropdown,
  CreateBatchLotRequest,
  UpdateBatchLotRequest,
};

const BATCH_LOTS_QUERY_KEY = 'batchLots';

export const useBatchLots = (
  params?: BatchLotsQueryParams,
  options?: { enabled?: boolean }
) => {
  return useQuery<BatchLotsResponse>({
    queryKey: [BATCH_LOTS_QUERY_KEY, params],
    queryFn: () => batchLotsService.getBatchLots(params),
    enabled: options?.enabled,
  });
};

export const useBatchLotById = (
  id: number,
  options?: { enabled?: boolean }
) => {
  return useQuery<{ data: BatchLot }>({
    queryKey: [BATCH_LOTS_QUERY_KEY, id],
    queryFn: () => batchLotsService.getBatchLotById(id),
    enabled: options?.enabled !== false && !!id,
  });
};

export const useCreateBatchLot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBatchLotRequest) =>
      batchLotsService.createBatchLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BATCH_LOTS_QUERY_KEY] });
      toast.success('Batch lot created successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create batch lot'
      );
    },
  });
};

export const useUpdateBatchLot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBatchLotRequest) =>
      batchLotsService.updateBatchLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BATCH_LOTS_QUERY_KEY] });
      toast.success('Batch lot updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update batch lot'
      );
    },
  });
};

export const useDeleteBatchLot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => batchLotsService.deleteBatchLot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BATCH_LOTS_QUERY_KEY] });
      toast.success('Batch lot deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete batch lot'
      );
    },
  });
};

export const useBatchLot = (id: number) => {
  return useQuery({
    queryKey: ['batchLot', id],
    queryFn: () => batchLotsService.fetchBatchLotById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBatchLotsDropdown = (params?: {
  search?: string;
  batch_lot_id?: number;
}) => {
  return useQuery<{ data: BatchLotDropdown[] }>({
    queryKey: ['batchLotsDropdown', params],
    queryFn: () => batchLotsService.getBatchLotsDropdown(params),
  });
};
