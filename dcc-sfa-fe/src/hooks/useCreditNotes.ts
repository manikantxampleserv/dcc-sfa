/**
 * @fileoverview Credit Notes React Query Hooks
 * @description Custom hooks for credit notes data management with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCreditNote,
  deleteCreditNote,
  fetchCreditNoteById,
  fetchCreditNotes,
  updateCreditNote,
  type GetCreditNotesParams,
  type ManageCreditNotePayload,
  type UpdateCreditNotePayload,
  type CreditNote,
} from '../services/masters/CreditNotes';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const creditNoteKeys = {
  all: ['creditNotes'] as const,
  lists: () => [...creditNoteKeys.all, 'list'] as const,
  list: (params: GetCreditNotesParams) =>
    [...creditNoteKeys.lists(), params] as const,
  details: () => [...creditNoteKeys.all, 'detail'] as const,
  detail: (id: number) => [...creditNoteKeys.details(), id] as const,
};

/**
 * Hook to fetch credit notes with pagination and filters
 */
export const useCreditNotes = (params?: GetCreditNotesParams) => {
  return useQuery({
    queryKey: creditNoteKeys.list(params || {}),
    queryFn: () => fetchCreditNotes(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single credit note by ID
 */
export const useCreditNote = (id: number) => {
  return useQuery({
    queryKey: creditNoteKeys.detail(id),
    queryFn: () => fetchCreditNoteById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new credit note
 */
export const useCreateCreditNote = (options?: {
  onSuccess?: (data: any, variables: ManageCreditNotePayload) => void;
  onError?: (error: any, variables: ManageCreditNotePayload) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: createCreditNote,
    loadingMessage: 'Creating credit note...',
    onSuccess: (data, variables) => {
      // Invalidate and refetch credit notes list
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing credit note
 */
export const useUpdateCreditNote = (options?: {
  onSuccess?: (
    data: any,
    variables: { id: number } & UpdateCreditNotePayload
  ) => void;
  onError?: (
    error: any,
    variables: { id: number } & UpdateCreditNotePayload
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({
      id,
      ...creditNoteData
    }: { id: number } & UpdateCreditNotePayload) =>
      updateCreditNote(id, creditNoteData),
    loadingMessage: 'Updating credit note...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: creditNoteKeys.detail(variables.id),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete a credit note
 */
export const useDeleteCreditNote = (options?: {
  onSuccess?: (data: any, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: deleteCreditNote,
    loadingMessage: 'Deleting credit note...',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.lists() });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
};

export type {
  GetCreditNotesParams,
  ManageCreditNotePayload,
  UpdateCreditNotePayload,
  CreditNote,
};
