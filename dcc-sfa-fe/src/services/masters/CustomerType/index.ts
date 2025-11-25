import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface CustomerType {
  id: number;
  type_name: string;
  type_code: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface ManageCustomerTypePayload {
  type_name: string;
  is_active?: string;
}

export interface UpdateCustomerTypePayload {
  type_name?: string;
  is_active?: string;
}

export interface GetCustomerTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
}

export const fetchCustomerTypes = async (
  params?: GetCustomerTypesParams
): Promise<ApiResponse<CustomerType[]>> => {
  try {
    const response = await api.get('/customer-types', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch customer types'
    );
  }
};

export const fetchCustomerTypeById = async (
  id: number
): Promise<CustomerType> => {
  try {
    const response = await api.get(`/customer-types/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching customer type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch customer type'
    );
  }
};

export const createCustomerType = async (
  data: ManageCustomerTypePayload
): Promise<ApiResponse<CustomerType>> => {
  try {
    const response = await api.post('/customer-types', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating customer type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create customer type'
    );
  }
};

export const updateCustomerType = async (
  id: number,
  data: UpdateCustomerTypePayload
): Promise<ApiResponse<CustomerType>> => {
  try {
    const response = await api.put(`/customer-types/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating customer type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update customer type'
    );
  }
};

export const deleteCustomerType = async (id: number): Promise<void> => {
  try {
    await api.delete(`/customer-types/${id}`);
  } catch (error: any) {
    console.error('Error deleting customer type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete customer type'
    );
  }
};
