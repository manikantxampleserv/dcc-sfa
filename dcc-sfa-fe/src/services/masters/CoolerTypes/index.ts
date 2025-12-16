import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface CoolerType {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageCoolerTypePayload {
  name: string;
  code?: string;
  description?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateCoolerTypePayload {
  name?: string;
  code?: string;
  description?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetCoolerTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const fetchCoolerTypes = async (
  params?: GetCoolerTypesParams
): Promise<ApiResponse<CoolerType[]>> => {
  try {
    const response = await api.get('/cooler-types', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cooler types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler types'
    );
  }
};

export const fetchCoolerTypeById = async (
  id: number
): Promise<ApiResponse<CoolerType>> => {
  try {
    const response = await api.get(`/cooler-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cooler type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler type'
    );
  }
};

export const createCoolerType = async (
  coolerTypeData: ManageCoolerTypePayload
): Promise<ApiResponse<CoolerType>> => {
  try {
    const response = await api.post('/cooler-types', coolerTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating cooler type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create cooler type'
    );
  }
};

export const updateCoolerType = async (
  id: number,
  coolerTypeData: UpdateCoolerTypePayload
): Promise<ApiResponse<CoolerType>> => {
  try {
    const response = await api.put(`/cooler-types/${id}`, coolerTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating cooler type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update cooler type'
    );
  }
};

export const deleteCoolerType = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/cooler-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting cooler type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete cooler type'
    );
  }
};

export const fetchCoolerTypesDropdown = async (): Promise<
  ApiResponse<{ id: number; name: string; code: string }[]>
> => {
  try {
    const response = await api.get('/cooler-types-dropdown');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cooler types dropdown:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler types dropdown'
    );
  }
};

export type {
  GetCoolerTypesParams,
  ManageCoolerTypePayload,
  UpdateCoolerTypePayload,
  PaginationMeta,
  CoolerType,
};
