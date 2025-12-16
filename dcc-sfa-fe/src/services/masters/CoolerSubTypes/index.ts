import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface CoolerSubType {
  id: number;
  name: string;
  code: string;
  cooler_type_id: number;
  description?: string | null;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
  cooler_type?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

interface ManageCoolerSubTypePayload {
  name: string;
  code?: string;
  cooler_type_id: number;
  description?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateCoolerSubTypePayload {
  name?: string;
  code?: string;
  cooler_type_id?: number;
  description?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetCoolerSubTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  coolerTypeId?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const fetchCoolerSubTypes = async (
  params?: GetCoolerSubTypesParams
): Promise<ApiResponse<CoolerSubType[]>> => {
  try {
    const response = await api.get('/cooler-sub-types', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cooler sub types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler sub types'
    );
  }
};

export const fetchCoolerSubTypeById = async (
  id: number
): Promise<ApiResponse<CoolerSubType>> => {
  try {
    const response = await api.get(`/cooler-sub-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cooler sub type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler sub type'
    );
  }
};

export const createCoolerSubType = async (
  coolerSubTypeData: ManageCoolerSubTypePayload
): Promise<ApiResponse<CoolerSubType>> => {
  try {
    const response = await api.post('/cooler-sub-types', coolerSubTypeData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating cooler sub type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create cooler sub type'
    );
  }
};

export const updateCoolerSubType = async (
  id: number,
  coolerSubTypeData: UpdateCoolerSubTypePayload
): Promise<ApiResponse<CoolerSubType>> => {
  try {
    const response = await api.put(
      `/cooler-sub-types/${id}`,
      coolerSubTypeData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating cooler sub type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update cooler sub type'
    );
  }
};

export const deleteCoolerSubType = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/cooler-sub-types/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting cooler sub type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete cooler sub type'
    );
  }
};

export const fetchCoolerSubTypesDropdown = async (
  cooler_type_id?: number
): Promise<
  ApiResponse<
    { id: number; name: string; code: string; cooler_type_id: number }[]
  >
> => {
  try {
    const response = await api.get('/cooler-sub-types-dropdown', {
      params: { cooler_type_id },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cooler sub types dropdown:', error);
    throw new Error(
      error.response?.data?.message ||
        'Failed to fetch cooler sub types dropdown'
    );
  }
};

export type {
  GetCoolerSubTypesParams,
  ManageCoolerSubTypePayload,
  UpdateCoolerSubTypePayload,
  PaginationMeta,
  CoolerSubType,
};
