import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface TaxMaster {
  id: number;
  name: string;
  code: string;
  tax_rate: number;
  description?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface ManageTaxMasterPayload {
  name: string;
  code: string;
  tax_rate: number;
  description?: string;
  is_active?: string;
}

export interface UpdateTaxMasterPayload {
  name?: string;
  code?: string;
  tax_rate?: number;
  description?: string;
  is_active?: string;
}

export interface GetTaxMastersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

export const fetchTaxMasters = async (
  params?: GetTaxMastersParams
): Promise<ApiResponse<TaxMaster[]>> => {
  try {
    const response = await api.get('/tax-masters', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching tax masters:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch tax masters'
    );
  }
};

export const fetchTaxMasterById = async (id: number): Promise<TaxMaster> => {
  try {
    const response = await api.get(`/tax-masters/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching tax master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch tax master'
    );
  }
};

export const createTaxMaster = async (
  data: ManageTaxMasterPayload
): Promise<ApiResponse<TaxMaster>> => {
  try {
    const response = await api.post('/tax-masters', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating tax master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create tax master'
    );
  }
};

export const updateTaxMaster = async (
  id: number,
  data: UpdateTaxMasterPayload
): Promise<ApiResponse<TaxMaster>> => {
  try {
    const response = await api.put(`/tax-masters/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating tax master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update tax master'
    );
  }
};

export const deleteTaxMaster = async (id: number): Promise<void> => {
  try {
    await api.delete(`/tax-masters/${id}`);
  } catch (error: any) {
    console.error('Error deleting tax master:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete tax master'
    );
  }
};
