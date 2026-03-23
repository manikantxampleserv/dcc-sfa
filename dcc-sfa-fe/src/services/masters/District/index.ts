import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface District {
  id: number;
  region_id: number;
  name: string;
  code: string;
  description?: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  district_regions?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

export interface ManageDistrictPayload {
  region_id: number;
  name: string;
  code?: string;
  description?: string;
  is_active?: string;
}

export interface UpdateDistrictPayload {
  region_id?: number;
  name?: string;
  code?: string;
  description?: string;
  is_active?: string;
}

export interface GetDistrictsParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
  region_id?: number;
}

export const fetchDistricts = async (
  params?: GetDistrictsParams
): Promise<ApiResponse<District[]>> => {
  try {
    const response = await api.get('/districts', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching districts:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch districts'
    );
  }
};

export const fetchDistrictById = async (
  id: number
): Promise<District> => {
  try {
    const response = await api.get(`/districts/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching district:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch district'
    );
  }
};

export const createDistrict = async (
  data: ManageDistrictPayload
): Promise<ApiResponse<District>> => {
  try {
    const response = await api.post('/districts', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating district:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create district'
    );
  }
};

export const updateDistrict = async (
  id: number,
  data: UpdateDistrictPayload
): Promise<ApiResponse<District>> => {
  try {
    const response = await api.put(`/districts/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating district:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update district'
    );
  }
};

export const deleteDistrict = async (id: number): Promise<void> => {
  try {
    await api.delete(`/districts/${id}`);
  } catch (error: any) {
    console.error('Error deleting district:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete district'
    );
  }
};
