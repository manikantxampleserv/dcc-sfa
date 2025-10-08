/**
 * @fileoverview Vehicles Service with API Integration
 * @description Provides vehicles CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface Vehicle {
  id: number;
  vehicle_number: string;
  type: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  capacity?: number | null;
  fuel_type?: string | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_location_update?: string | null;
  assigned_to?: number | null;
  status?: string | null;
  fuel_level?: number | null;
  mileage?: number | null;
  last_service_date?: string | null;
  next_service_due?: string | null;
  insurance_expiry?: string | null;
  registration_expiry?: string | null;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageVehiclePayload {
  vehicle_number: string;
  type: string;
  make?: string;
  model?: string;
  year?: number;
  capacity?: number;
  fuel_type?: string;
  status?: string;
  mileage?: number;
  is_active?: string;
  createdby?: number;
}

interface UpdateVehiclePayload {
  vehicle_number?: string;
  type?: string;
  make?: string;
  model?: string;
  year?: number;
  capacity?: number;
  fuel_type?: string;
  status?: string;
  mileage?: number;
  is_active?: string;
  updatedby?: number;
}

interface GetVehiclesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  type?: string;
  status?: string;
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
 * Fetch vehicles with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Vehicle[]>>
 */
export const fetchVehicles = async (
  params?: GetVehiclesParams
): Promise<ApiResponse<Vehicle[]>> => {
  try {
    const response = await api.get('/vehicles', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch vehicles'
    );
  }
};

/**
 * Fetch vehicle by ID
 * @param id - Vehicle ID
 * @returns Promise<ApiResponse<Vehicle>>
 */
export const fetchVehicleById = async (
  id: number
): Promise<ApiResponse<Vehicle>> => {
  try {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching vehicle:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch vehicle');
  }
};

/**
 * Create new vehicle
 * @param vehicleData - Vehicle creation payload
 * @returns Promise<ApiResponse<Vehicle>>
 */
export const createVehicle = async (
  vehicleData: ManageVehiclePayload
): Promise<ApiResponse<Vehicle>> => {
  try {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create vehicle'
    );
  }
};

/**
 * Update existing vehicle
 * @param id - Vehicle ID
 * @param vehicleData - Vehicle update payload
 * @returns Promise<ApiResponse<Vehicle>>
 */
export const updateVehicle = async (
  id: number,
  vehicleData: UpdateVehiclePayload
): Promise<ApiResponse<Vehicle>> => {
  try {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update vehicle'
    );
  }
};

/**
 * Delete vehicle
 * @param id - Vehicle ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteVehicle = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete vehicle'
    );
  }
};

export type {
  GetVehiclesParams,
  ManageVehiclePayload,
  UpdateVehiclePayload,
  PaginationMeta,
  Vehicle,
};
