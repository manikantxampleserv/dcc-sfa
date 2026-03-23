import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface Region {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface ManageRegionPayload {
  name: string;
  code?: string;
  description?: string;
  is_active?: string;
}

export interface UpdateRegionPayload {
  name?: string;
  code?: string;
  description?: string;
  is_active?: string;
}

export interface GetRegionsParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
}

export const fetchRegions = async (
  params?: GetRegionsParams
): Promise<ApiResponse<Region[]>> => {
  try {
    const response = await api.get('/regions', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching regions:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch regions');
  }
};

export const fetchRegionById = async (id: number): Promise<Region> => {
  try {
    const response = await api.get(`/regions/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching region:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch region');
  }
};

export const createRegion = async (
  data: ManageRegionPayload
): Promise<ApiResponse<Region>> => {
  try {
    const response = await api.post('/regions', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating region:', error);
    throw new Error(error.response?.data?.message || 'Failed to create region');
  }
};

export const updateRegion = async (
  id: number,
  data: UpdateRegionPayload
): Promise<ApiResponse<Region>> => {
  try {
    const response = await api.put(`/regions/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating region:', error);
    throw new Error(error.response?.data?.message || 'Failed to update region');
  }
};

export const deleteRegion = async (id: number): Promise<void> => {
  try {
    await api.delete(`/regions/${id}`);
  } catch (error: any) {
    console.error('Error deleting region:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete region');
  }
};
