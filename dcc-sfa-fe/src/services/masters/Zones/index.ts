/**
 * @fileoverview Zone Service with API Integration
 * @description Provides zone CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface User {
  id: number;
  name: string;
  email: string;
  employee_id?: string;
}

interface Zone {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  description?: string | null;
  supervisor_id?: number | null;
  supervisor?: { id: number; name: string; email: string } | null;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  zone_depots?: {
    id: number;
    name: string;
    code: string;
  } | null;
  // Computed fields can still be used for fallback
  depot_name?: string;
  supervisor_name?: string;
}

interface ManageZonePayload {
  parent_id: number;
  name: string;
  description?: string;
  supervisor_id?: number;
  is_active?: string;
  createdby?: number;
}

interface UpdateZonePayload {
  parent_id?: number;
  name?: string;
  code?: string;
  description?: string;
  supervisor_id?: number;
  is_active?: string;
  updatedby?: number;
}

interface GetZonesParams {
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
 * Fetch zones with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Zone[]>>
 */
export const fetchZones = async (
  params?: GetZonesParams
): Promise<ApiResponse<Zone[]>> => {
  try {
    const response = await api.get('/zones', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching zones:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch zones');
  }
};

/**
 * Fetch zone by ID
 * @param id - Zone ID
 * @returns Promise<ApiResponse<Zone>>
 */
export const fetchZoneById = async (id: number): Promise<ApiResponse<Zone>> => {
  try {
    const response = await api.get(`/zones/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching zone:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch zone');
  }
};

/**
 * Create new zone
 * @param zoneData - Zone creation payload
 * @returns Promise<ApiResponse<Zone>>
 */
export const createZone = async (
  zoneData: ManageZonePayload
): Promise<ApiResponse<Zone>> => {
  try {
    const response = await api.post('/zones', zoneData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating zone:', error);
    throw new Error(error.response?.data?.message || 'Failed to create zone');
  }
};

/**
 * Update existing zone
 * @param id - Zone ID
 * @param zoneData - Zone update payload
 * @returns Promise<ApiResponse<Zone>>
 */
export const updateZone = async (
  id: number,
  zoneData: UpdateZonePayload
): Promise<ApiResponse<Zone>> => {
  try {
    const response = await api.put(`/zones/${id}`, zoneData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating zone:', error);
    throw new Error(error.response?.data?.message || 'Failed to update zone');
  }
};

/**
 * Delete zone
 * @param id - Zone ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteZone = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/zones/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting zone:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete zone');
  }
};

/**
 * Fetch zone supervisors (Area Sales Supervisor role only)
 * @param search - Optional search term for filtering supervisors
 * @returns Promise<ApiResponse<User[]>>
 */
export const fetchSupervisors = async (
  search?: string
): Promise<ApiResponse<User[]>> => {
  try {
    const response = await api.get('/zone/supervisors', {
      params: search ? { search } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supervisors:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch supervisors'
    );
  }
};

export type {
  GetZonesParams,
  ManageZonePayload,
  UpdateZonePayload,
  PaginationMeta,
  Zone,
  User,
};
