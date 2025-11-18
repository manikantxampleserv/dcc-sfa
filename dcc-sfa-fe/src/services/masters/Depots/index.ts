/**
 * @fileoverview Depot Service with API Integration
 * @description Provides depot CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface Depot {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  phone_number?: string | null;
  email?: string | null;
  manager_id?: number | null;
  supervisor_id?: number | null;
  coordinator_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
  depot_companies?: {
    id: number;
    name: string;
    code: string;
  } | null;
  user_depot?: Array<{
    id: number;
    email: string;
    name: string;
  }>;
  depots_manager?: {
    id: number;
    name: string;
    email: string;
  } | null;
  depots_supervisior?: {
    id: number;
    name: string;
    email: string;
  } | null;
  depots_coodrinator?: {
    id: number;
    name: string;
    email: string;
  } | null;
  // Additional computed fields for display
  company_name?: string;
  manager_name?: string;
  supervisor_name?: string;
  coordinator_name?: string;
}

interface ManageDepotPayload {
  parent_id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  manager_id?: number;
  supervisor_id?: number;
  coordinator_id?: number;
  latitude?: number;
  longitude?: number;
  is_active?: string;
  createdby?: number;
}

interface UpdateDepotPayload {
  parent_id?: number;
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  manager_id?: number;
  supervisor_id?: number;
  coordinator_id?: number;
  latitude?: number;
  longitude?: number;
  is_active?: string;
  updatedby?: number;
}

interface GetDepotsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  parent_id?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Fetch depots with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Depot[]>>
 */
export const fetchDepots = async (
  params?: GetDepotsParams
): Promise<ApiResponse<Depot[]>> => {
  try {
    const response = await api.get('/depots', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching depots:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch depots');
  }
};

/**
 * Fetch depot by ID
 * @param id - Depot ID
 * @returns Promise<ApiResponse<Depot>>
 */
export const fetchDepotById = async (
  id: number
): Promise<ApiResponse<Depot>> => {
  try {
    const response = await api.get(`/depots/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching depot:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch depot');
  }
};

/**
 * Create new depot
 * @param depotData - Depot creation payload
 * @returns Promise<ApiResponse<Depot>>
 */
export const createDepot = async (
  depotData: ManageDepotPayload
): Promise<ApiResponse<Depot>> => {
  try {
    const response = await api.post('/depots', depotData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating depot:', error);
    throw new Error(error.response?.data?.message || 'Failed to create depot');
  }
};

/**
 * Update existing depot
 * @param id - Depot ID
 * @param depotData - Depot update payload
 * @returns Promise<ApiResponse<Depot>>
 */
export const updateDepot = async (
  id: number,
  depotData: UpdateDepotPayload
): Promise<ApiResponse<Depot>> => {
  try {
    const response = await api.put(`/depots/${id}`, depotData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating depot:', error);
    throw new Error(error.response?.data?.message || 'Failed to update depot');
  }
};

/**
 * Delete depot
 * @param id - Depot ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteDepot = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/depots/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting depot:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete depot');
  }
};

export type {
  GetDepotsParams,
  ManageDepotPayload,
  UpdateDepotPayload,
  PaginationMeta,
  Depot,
};
