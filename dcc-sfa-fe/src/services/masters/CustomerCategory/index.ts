import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface CustomerCategoryCondition {
  id?: number;
  condition_type: string;
  condition_operator: string;
  threshold_value: number;
  product_category_id?: number | null;
  condition_description?: string | null;
  is_active?: string;
}

export interface CustomerCategory {
  id: number;
  category_name: string;
  category_code: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  conditions?: CustomerCategoryCondition[];
}

export interface ManageCustomerCategoryPayload {
  category_name: string;
  category_code: string;
  is_active?: string;
  conditions?: CustomerCategoryCondition[];
}

export interface UpdateCustomerCategoryPayload {
  category_name?: string;
  category_code?: string;
  is_active?: string;
  conditions?: CustomerCategoryCondition[];
}

export interface GetCustomerCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
}

export const fetchCustomerCategories = async (
  params?: GetCustomerCategoriesParams
): Promise<ApiResponse<CustomerCategory[]>> => {
  try {
    const response = await api.get('/customer-category', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer categories:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch customer categories'
    );
  }
};

export const fetchCustomerCategoryById = async (
  id: number
): Promise<CustomerCategory> => {
  try {
    const response = await api.get(`/customer-category/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching customer category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch customer category'
    );
  }
};

export const createCustomerCategory = async (
  data: ManageCustomerCategoryPayload
): Promise<CustomerCategory> => {
  try {
    const response = await api.post('/customer-category/bulk', data);
    return response.data.results.created[0] || response.data.results.updated[0];
  } catch (error: any) {
    console.error('Error creating customer category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create customer category'
    );
  }
};

export const updateCustomerCategory = async (
  id: number,
  data: UpdateCustomerCategoryPayload
): Promise<CustomerCategory> => {
  try {
    const response = await api.post('/customer-category/bulk', { id, ...data });
    return response.data.results.updated[0];
  } catch (error: any) {
    console.error('Error updating customer category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update customer category'
    );
  }
};

export const deleteCustomerCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/customer-category/${id}`);
  } catch (error: any) {
    console.error('Error deleting customer category:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete customer category'
    );
  }
};

