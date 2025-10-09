/**
 * @fileoverview KPI Targets Service with API Integration
 * @description Provides KPI targets CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface KpiTarget {
  id: number;
  employee_id: number;
  kpi_name: string;
  target_value: string;
  measure_unit?: string | null;
  period_start: string;
  period_end: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  employee?: {
    id: number;
    name: string;
    email: string;
  } | null;
  kpi_actuals?: {
    id: number;
    actual_value: string;
    measured_date: string;
  }[];
}

interface ManageKpiTargetPayload {
  employee_id: number;
  kpi_name: string;
  target_value: string;
  measure_unit?: string;
  period_start: string;
  period_end: string;
  is_active?: string;
}

interface UpdateKpiTargetPayload {
  employee_id?: number;
  kpi_name?: string;
  target_value?: string;
  measure_unit?: string;
  period_start?: string;
  period_end?: string;
  is_active?: string;
}

interface GetKpiTargetsParams {
  page?: number;
  limit?: number;
  search?: string;
  employee_id?: number;
  is_active?: string;
}

/**
 * Fetch KPI targets with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with KPI targets data
 */
export const fetchKpiTargets = async (
  params?: GetKpiTargetsParams
): Promise<ApiResponse<KpiTarget[]>> => {
  try {
    const response = await api.get('/kpi-targets', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching KPI targets:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch KPI targets'
    );
  }
};

/**
 * Fetch KPI target by ID
 * @param id - KPI target ID
 * @returns Promise resolving to KPI target data
 */
export const fetchKpiTargetById = async (id: number): Promise<KpiTarget> => {
  try {
    const response = await api.get(`/kpi-targets/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching KPI target:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch KPI target'
    );
  }
};

/**
 * Create a new KPI target
 * @param data - KPI target data
 * @returns Promise resolving to created KPI target
 */
export const createKpiTarget = async (
  data: ManageKpiTargetPayload
): Promise<KpiTarget> => {
  try {
    const response = await api.post('/kpi-targets', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating KPI target:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create KPI target'
    );
  }
};

/**
 * Update an existing KPI target
 * @param id - KPI target ID
 * @param data - Updated KPI target data
 * @returns Promise resolving to updated KPI target
 */
export const updateKpiTarget = async (
  id: number,
  data: UpdateKpiTargetPayload
): Promise<KpiTarget> => {
  try {
    const response = await api.put(`/kpi-targets/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating KPI target:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update KPI target'
    );
  }
};

/**
 * Delete a KPI target (soft delete)
 * @param id - KPI target ID
 * @returns Promise resolving when deletion is complete
 */
export const deleteKpiTarget = async (id: number): Promise<void> => {
  try {
    await api.delete(`/kpi-targets/${id}`);
  } catch (error: any) {
    console.error('Error deleting KPI target:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete KPI target'
    );
  }
};

// Export types
export type {
  KpiTarget,
  ManageKpiTargetPayload,
  UpdateKpiTargetPayload,
  GetKpiTargetsParams,
};
