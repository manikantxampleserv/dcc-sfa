/**
 * @fileoverview Company Management Hooks with React Query and Toast Integration
 * @description Provides hooks for company CRUD operations with automatic caching and toast notifications
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import * as companyService from '../services/masters/Companies';
import type { ApiResponse } from '../types/api.types';

export type {
  Company,
  ManageCompanyPayload,
  GetCompaniesParams,
} from '../services/masters/Companies';

/**
 * Query keys for company-related queries
 */
export const companyQueryKeys = {
  all: ['companies'] as const,
  lists: () => [...companyQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...companyQueryKeys.lists(), params] as const,
  details: () => [...companyQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...companyQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch companies with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns Query result with companies data
 */
export const useCompanies = (
  params?: companyService.GetCompaniesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<companyService.Company[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: companyQueryKeys.list(params),
    queryFn: () => companyService.fetchCompanies(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch a single company by ID
 * @param id - Company ID
 * @returns Query result with company data
 */
export const useCompany = (id: number) => {
  return useQuery({
    queryKey: companyQueryKeys.detail(id),
    queryFn: () => companyService.fetchCompanyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new company
 * @param options - Additional options for the mutation
 * @returns Mutation for creating companies
 */
export const useCreateCompany = (options?: {
  onSuccess?: (
    data: ApiResponse<companyService.Company>,
    variables: companyService.ManageCompanyPayload | FormData
  ) => void;
  onError?: (
    error: any,
    variables: companyService.ManageCompanyPayload | FormData
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: (companyData: companyService.ManageCompanyPayload | FormData) =>
      companyService.createCompany(companyData),
    loadingMessage: 'Creating company...',
    invalidateQueries: ['companies'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to update an existing company
 * @param options - Additional options for the mutation
 * @returns Mutation for updating companies
 */
export const useUpdateCompany = (options?: {
  onSuccess?: (
    data: ApiResponse<companyService.Company>,
    variables: {
      id: number;
      companyData: companyService.ManageCompanyPayload | FormData;
    }
  ) => void;
  onError?: (
    error: any,
    variables: {
      id: number;
      companyData: companyService.ManageCompanyPayload | FormData;
    }
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: ({
      id,
      companyData,
    }: {
      id: number;
      companyData: companyService.ManageCompanyPayload | FormData;
    }) => companyService.updateCompany(id, companyData),
    loadingMessage: 'Updating company...',
    invalidateQueries: ['companies'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to delete a company
 * @param options - Additional options for the mutation
 * @returns Mutation for deleting companies
 */
export const useDeleteCompany = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => companyService.deleteCompany(id),
    loadingMessage: 'Deleting company...',
    invalidateQueries: ['companies'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
