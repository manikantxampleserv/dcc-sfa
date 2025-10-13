/**
 * @fileoverview Unit of Measurement Service with API Integration
 * @description Provides Unit of Measurement CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface UnitOfMeasurement {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  symbol?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  product_unit_of_measurement?: { id: number; name: string }[];
}

interface ManageUnitOfMeasurementPayload {
  name: string;
  description?: string;
  category?: string;
  symbol?: string;
  is_active?: string;
}

interface UpdateUnitOfMeasurementPayload {
  name?: string;
  description?: string;
  category?: string;
  symbol?: string;
  is_active?: string;
}

interface GetUnitOfMeasurementParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * Fetch Unit of Measurement with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with Unit of Measurement data
 */
export const fetchUnitOfMeasurement = async (
  params?: GetUnitOfMeasurementParams
): Promise<ApiResponse<UnitOfMeasurement[]>> => {
  try {
    const response = await api.get('/unit-measurement', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching unit of measurement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch unit of measurement'
    );
  }
};

/**
 * Fetch Unit of Measurement by ID
 * @param id - Unit of Measurement ID
 * @returns Promise resolving to Unit of Measurement data
 */
export const fetchUnitOfMeasurementById = async (
  id: number
): Promise<UnitOfMeasurement> => {
  try {
    const response = await api.get(`/unit-measurement/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching unit of measurement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch unit of measurement'
    );
  }
};

/**
 * Create a new Unit of Measurement
 * @param data - Unit of Measurement data
 * @returns Promise resolving to created Unit of Measurement
 */
export const createUnitOfMeasurement = async (
  data: ManageUnitOfMeasurementPayload
): Promise<UnitOfMeasurement> => {
  try {
    const response = await api.post('/unit-measurement', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating unit of measurement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create unit of measurement'
    );
  }
};

/**
 * Update an existing Unit of Measurement
 * @param id - Unit of Measurement ID
 * @param data - Updated Unit of Measurement data
 * @returns Promise resolving to updated Unit of Measurement
 */
export const updateUnitOfMeasurement = async (
  id: number,
  data: UpdateUnitOfMeasurementPayload
): Promise<UnitOfMeasurement> => {
  try {
    const response = await api.put(`/unit-measurement/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating unit of measurement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update unit of measurement'
    );
  }
};

/**
 * Delete a Unit of Measurement (soft delete)
 * @param id - Unit of Measurement ID
 * @returns Promise resolving when deletion is complete
 */
export const deleteUnitOfMeasurement = async (id: number): Promise<void> => {
  try {
    await api.delete(`/unit-measurement/${id}`);
  } catch (error: any) {
    console.error('Error deleting unit of measurement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete unit of measurement'
    );
  }
};

// Export types
export type {
  UnitOfMeasurement,
  ManageUnitOfMeasurementPayload,
  UpdateUnitOfMeasurementPayload,
  GetUnitOfMeasurementParams,
};
