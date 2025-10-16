import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface CompetitorActivity {
  id: number;
  customer_id?: number | null;
  visit_id?: number | null;
  brand_name: string;
  product_name?: string | null;
  observed_price?: number | null;
  promotion_details?: string | null;
  visibility_score?: number | null;
  image_url?: string | null;
  remarks?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  competitor_activity_customers?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  visits?: {
    id: number;
    visit_date: string;
    purpose?: string | null;
  } | null;
}

export interface CreateCompetitorActivityPayload {
  customer_id: number;
  visit_id?: number;
  brand_name: string;
  product_name?: string;
  observed_price?: number;
  promotion_details?: string;
  visibility_score?: number;
  image_url?: string;
  remarks?: string;
  is_active?: string;
}

export interface UpdateCompetitorActivityPayload {
  customer_id?: number;
  visit_id?: number;
  brand_name?: string;
  product_name?: string;
  observed_price?: number;
  promotion_details?: string;
  visibility_score?: number;
  image_url?: string;
  remarks?: string;
  is_active?: string;
}

export interface CompetitorActivityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customer_id?: number;
  brand_name?: string;
}

export interface CompetitorActivityStats {
  total_records: number;
  active_records: number;
  inactive_records: number;
  this_month_records: number;
}

export const fetchCompetitorActivities = async (
  params?: CompetitorActivityQueryParams
): Promise<ApiResponse<CompetitorActivity[]>> => {
  try {
    const response = await axiosInstance.get('/competitor-activity', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching competitor activities:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch competitor activities'
    );
  }
};

export const fetchCompetitorActivityById = async (
  id: number
): Promise<CompetitorActivity> => {
  try {
    const response = await axiosInstance.get(`/competitor-activity/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching competitor activity:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch competitor activity'
    );
  }
};

export const createCompetitorActivity = async (
  data: CreateCompetitorActivityPayload
): Promise<CompetitorActivity> => {
  try {
    const response = await axiosInstance.post('/competitor-activity', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating competitor activity:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create competitor activity'
    );
  }
};

export const updateCompetitorActivity = async (
  id: number,
  data: UpdateCompetitorActivityPayload
): Promise<CompetitorActivity> => {
  try {
    const response = await axiosInstance.put(
      `/competitor-activity/${id}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating competitor activity:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update competitor activity'
    );
  }
};

export const deleteCompetitorActivity = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/competitor-activity/${id}`);
  } catch (error: any) {
    console.error('Error deleting competitor activity:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete competitor activity'
    );
  }
};
