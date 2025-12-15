import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface ProductVolume {
  id: number;
  name: string;
  code: string;
  is_active: string;
  created_by: number;
  createdate?: string | null;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageProductVolumePayload {
  name: string;
  code?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateProductVolumePayload {
  name?: string;
  code?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetProductVolumesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

export const fetchProductVolumes = async (
  params?: GetProductVolumesParams
): Promise<ApiResponse<ProductVolume[]>> => {
  try {
    const response = await api.get('/product-volumes', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product volumes:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product volumes'
    );
  }
};

export const fetchProductVolumeById = async (
  id: number
): Promise<ApiResponse<ProductVolume>> => {
  try {
    const response = await api.get(`/product-volumes/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product volume:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product volume'
    );
  }
};

export const createProductVolume = async (
  volumeData: ManageProductVolumePayload
): Promise<ApiResponse<ProductVolume>> => {
  try {
    const response = await api.post('/product-volumes', volumeData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating product volume:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create product volume'
    );
  }
};

export const updateProductVolume = async (
  id: number,
  volumeData: UpdateProductVolumePayload
): Promise<ApiResponse<ProductVolume>> => {
  try {
    const response = await api.put(`/product-volumes/${id}`, volumeData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating product volume:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update product volume'
    );
  }
};

export const deleteProductVolume = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/product-volumes/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product volume:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete product volume'
    );
  }
};

interface ProductVolumeDropdown {
  id: number;
  name: string;
  code: string;
}

interface GetProductVolumesDropdownParams {
  search?: string;
  volume_id?: number;
}

export const fetchProductVolumesDropdown = async (
  params?: GetProductVolumesDropdownParams
): Promise<ApiResponse<ProductVolumeDropdown[]>> => {
  try {
    const response = await api.get('/product-volumes-dropdown', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product volumes dropdown:', error);
    throw new Error(
      error.response?.data?.message ||
        'Failed to fetch product volumes dropdown'
    );
  }
};

export type {
  GetProductVolumesParams,
  GetProductVolumesDropdownParams,
  ManageProductVolumePayload,
  UpdateProductVolumePayload,
  ProductVolume,
  ProductVolumeDropdown,
};
