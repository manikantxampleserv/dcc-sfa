/**
 * @fileoverview Sub Unit of Measurement Service with API Integration
 * @description Provides Sub Unit of Measurement CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface SubUnitOfMeasurement {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  unit_of_measurement_id: number;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  subunits_unit_of_measurement?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

interface ManageSubUnitOfMeasurementPayload {
  name: string;
  code?: string;
  description?: string;
  unit_of_measurement_id: number;
  is_active?: string;
}

interface UpdateSubUnitOfMeasurementPayload {
  name?: string;
  code?: string;
  description?: string;
  unit_of_measurement_id?: number;
  is_active?: string;
}

interface GetSubUnitOfMeasurementsParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  isActive?: string;
  unitOfMeasurementId?: number;
}

/**
 * Fetch Sub Unit of Measurements with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to API response with Sub Unit of Measurements data
 */
export const fetchSubUnitOfMeasurements = async (
  params?: GetSubUnitOfMeasurementsParams
): Promise<ApiResponse<SubUnitOfMeasurement[]>> => {
  try {
    const response = await api.get('/subunits', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sub unit of measurements:', error);
    throw new Error(
      error.response?.data?.message ||
        'Failed to fetch sub unit of measurements'
    );
  }
};

/**
 * Fetch Sub Unit of Measurement by ID
 * @param id - Sub Unit of Measurement ID
 * @returns Promise resolving to Sub Unit of Measurement data
 */
export const fetchSubUnitOfMeasurementById = async (
  id: number
): Promise<SubUnitOfMeasurement> => {
  try {
    const response = await api.get(`/subunits/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching sub unit of measurement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch sub unit of measurement'
    );
  }
};

/**
 * Create a new Sub Unit of Measurement
 * @param data - Sub Unit of Measurement data
 * @returns Promise resolving to created Sub Unit of Measurement
 */
export const createSubUnitOfMeasurement = async (
  data: ManageSubUnitOfMeasurementPayload
): Promise<SubUnitOfMeasurement> => {
  try {
    const response = await api.post('/subunits', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating sub unit of measurement:', error);
    throw new Error(
      error.response?.data?.message ||
        'Failed to create sub unit of measurement'
    );
  }
};

/**
 * Update an existing Sub Unit of Measurement
 * @param id - Sub Unit of Measurement ID
 * @param data - Updated Sub Unit of Measurement data
 * @returns Promise resolving to updated Sub Unit of Measurement
 */
export const updateSubUnitOfMeasurement = async (
  id: number,
  data: UpdateSubUnitOfMeasurementPayload
): Promise<SubUnitOfMeasurement> => {
  try {
    const response = await api.put(`/subunits/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating sub unit of measurement:', error);
    throw new Error(
      error.response?.data?.message ||
        'Failed to update sub unit of measurement'
    );
  }
};

/**
 * Delete a Sub Unit of Measurement (soft delete)
 * @param id - Sub Unit of Measurement ID
 * @returns Promise resolving when deletion is complete
 */
export const deleteSubUnitOfMeasurement = async (id: number): Promise<void> => {
  try {
    await api.delete(`/subunits/${id}`);
  } catch (error: any) {
    console.error('Error deleting sub unit of measurement:', error);
    throw new Error(
      error.response?.data?.message ||
        'Failed to delete sub unit of measurement'
    );
  }
};

/**
 * Fetch Units of Measurement for dropdown/lookup
 * @returns Promise resolving to units of measurement data
 */
export const fetchUnitsOfMeasurementLookup = async (): Promise<any[]> => {
  try {
    const response = await api.get('/subunits/lookup/units-of-measurement');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching units of measurement:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch units of measurement'
    );
  }
};

/**
 * Fetch Products for dropdown/lookup
 * @returns Promise resolving to products data
 */
export const fetchProductsLookup = async (): Promise<any[]> => {
  try {
    const response = await api.get('/subunits/lookup/products');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch products'
    );
  }
};

export type {
  SubUnitOfMeasurement,
  ManageSubUnitOfMeasurementPayload,
  UpdateSubUnitOfMeasurementPayload,
  GetSubUnitOfMeasurementsParams,
};
