import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface UpdatedPromotion {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  is_active: string;
  createdby: number;
  createdate?: Date | null;
  updatedate?: Date | null;
  updatedby?: number | null;
  depots?: Array<{
    id: number;
    depot_id: number;
    depots?: { id: number; name: string; code: string };
  }>;
  routes?: Array<{
    id: number;
    route_id: number;
  }>;
  salespersons?: Array<{
    id: number;
    salesperson_id: number;
  }>;
  customer_categories?: Array<{
    id: number;
    customer_category_id: number;
  }>;
  conditions?: Array<{
    id: number;
    condition_type: string;
    applies_to_type: string;
    min_value: number;
    promotion_condition_products?: Array<{
      id: number;
      product_id: number;
      category_id: number;
      product_group?: string | null;
      condition_quantity: number;
    }>;
  }>;
  levels?: Array<{
    id: number;
    level_number: number;
    threshold_value: number;
    discount_type: string;
    discount_value: number;
    promotion_benefit_level?: Array<{
      id: number;
      benefit_type: string;
      product_id?: number | null;
      benefit_value: number;
      condition_type?: string | null;
      gift_limit: number;
      promotion_benefit_products?: {
        id: number;
        name: string;
        code: string;
      } | null;
    }>;
  }>;
}

export interface CreateUpdatedPromotionPayload {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  platforms?: string[];
  quantity_type?: string;
  product_conditions?: Array<{
    product_id: number;
    category_id: number;
    product_group?: string;
    min_quantity?: number;
    min_value?: number;
  }>;
  location_areas?: number[];
  distributor_distributors?: number[];
  seller_data?: number[];
  outlet1_groups?: number[];
  outlet2_groups?: number[];
  levels?: Array<{
    level_number?: number;
    threshold_value?: number;
    discount_type?: string;
    discount_value?: number;
    benefits?: Array<{
      benefit_type?: string;
      product_id?: number;
      benefit_value?: number;
      condition_type?: string;
      gift_limit?: number;
    }>;
  }>;
  customer_exclusions?: number[];
}

export interface UpdateUpdatedPromotionPayload {
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  is_active?: string;
  platforms?: string[];
  location_areas?: number[];
  distributor_distributors?: number[];
  seller_data?: number[];
  outlet1_groups?: number[];
  outlet2_groups?: number[];
}

export interface GetUpdatedPromotionsParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
}

export const fetchUpdatedPromotions = async (
  params?: GetUpdatedPromotionsParams
): Promise<ApiResponse<UpdatedPromotion[]>> => {
  try {
    const response = await axiosInstance.get('/promotions', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUpdatedPromotionById = async (
  id: number
): Promise<ApiResponse<UpdatedPromotion>> => {
  try {
    const response = await axiosInstance.get(`/promotions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUpdatedPromotion = async (
  promotionData: CreateUpdatedPromotionPayload
): Promise<ApiResponse<UpdatedPromotion>> => {
  const response = await axiosInstance.post('/promotions', promotionData);
  return response.data;
};

export const updateUpdatedPromotion = async (
  id: number,
  promotionData: UpdateUpdatedPromotionPayload
): Promise<ApiResponse<UpdatedPromotion>> => {
  const response = await axiosInstance.put(`/promotions/${id}`, promotionData);
  return response.data;
};

export const deleteUpdatedPromotion = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/promotions/${id}`);
  return response.data;
};

export default {
  fetchUpdatedPromotions,
  fetchUpdatedPromotionById,
  createUpdatedPromotion,
  updateUpdatedPromotion,
  deleteUpdatedPromotion,
};
