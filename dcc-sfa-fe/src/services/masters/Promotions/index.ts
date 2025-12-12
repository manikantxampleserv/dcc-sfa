import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface Promotion {
  id: number;
  name: string;
  code: string;
  type?: string;
  start_date: string;
  end_date: string;
  description?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  channels?: Array<{ id: number; channel_type: string; is_active: string }>;
  depots?: Array<{
    id: number;
    depot_id: number;
    depots?: { id: number; name: string; code: string };
  }>;
  salespersons?: Array<{ id: number; salesperson_id: number }>;
  routes?: Array<{ id: number; route_id: number }>;
  zones?: Array<{
    id: number;
    zone_id: number;
    promotion_zones_zones?: { id: number; name: string; code: string };
  }>;
  customer_categories?: Array<{ id: number; customer_category_id: number }>;
  customer_types?: Array<{
    id: number;
    customer_type_id: number;
    promotion_customer_types_customer?: {
      id: number;
      type_name: string;
      type_code: string;
    };
  }>;
  customer_channels?: Array<{
    id: number;
    customer_channel_id: number;
    promotion_customer_channel_customer?: {
      id: number;
      channel_name: string;
      channel_code: string;
    };
  }>;
  customer_exclusions?: Array<{
    id: number;
    customer_id: number;
    is_excluded: string;
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

interface CreatePromotionPayload {
  name: string;
  code?: string;
  start_date: string;
  end_date: string;
  description?: string;
  disabled?: boolean;
  platforms?: string[];
  quantity_type?: string;
  product_conditions?: Array<{
    product_id?: number;
    category_id?: number;
    product_group?: string;
    min_quantity?: number;
    min_value?: number;
  }>;
  location_areas?: number[];
  routes?: number[];
  zones?: number[];
  salespersons?: number[];
  customer_exclusions?: number[];
  customer_types?: number[];
  customer_channels?: number[];
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
}

interface UpdatePromotionPayload {
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  is_active?: string;
  platforms?: string[];
  quantity_type?: string;
  product_conditions?: Array<{
    product_id?: number;
    category_id?: number;
    product_group?: string;
    min_quantity?: number;
    min_value?: number;
  }>;
  location_areas?: number[];
  routes?: number[];
  zones?: number[];
  salespersons?: number[];
  customer_exclusions?: number[];
  customer_types?: number[];
  customer_channels?: number[];
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
}

interface GetPromotionsParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
  activeonly?: boolean;
  platform?: string;
  depot_id?: number;
  salesperson_id?: number;
  route_id?: number;
  start_date?: string;
  end_date?: string;
}

interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

interface PromotionStats {
  total: number;
  active: number;
  inactive: number;
}

export const fetchPromotions = async (
  params?: GetPromotionsParams
): Promise<ApiResponse<Promotion[]>> => {
  try {
    const response = await axiosInstance.get('/promotions', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPromotionById = async (
  id: number
): Promise<ApiResponse<Promotion>> => {
  try {
    const response = await axiosInstance.get(`/promotions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPromotion = async (
  promotionData: CreatePromotionPayload
): Promise<ApiResponse<Promotion>> => {
  const response = await axiosInstance.post('/promotions', promotionData);
  return response.data;
};

export const updatePromotion = async (
  id: number,
  promotionData: UpdatePromotionPayload
): Promise<ApiResponse<Promotion>> => {
  const response = await axiosInstance.put(`/promotions/${id}`, promotionData);
  return response.data;
};

export const deletePromotion = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/promotions/${id}`);
  return response.data;
};

export const assignChannels = async (
  id: number,
  channels: string[]
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(`/promotions/${id}/cheannels`, {
    channels,
  });
  return response.data;
};

export const assignDepots = async (
  id: number,
  depot_ids: number[]
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(`/promotions/${id}/depots`, {
    depot_ids,
  });
  return response.data;
};

export const assignSalespersons = async (
  id: number,
  salesperson_ids: number[]
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(`/promotions/${id}/salesperson`, {
    salesperson_ids,
  });
  return response.data;
};

export const assignRoutes = async (
  id: number,
  route_ids: number[]
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(`/promotions/${id}/routes`, {
    route_ids,
  });
  return response.data;
};

export const assignCustomerCategories = async (
  id: number,
  customer_category_ids: number[]
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(
    `/promotions/${id}/customer-categories`,
    { customer_category_ids }
  );
  return response.data;
};

export const assignCustomerExclusions = async (
  id: number,
  customer_ids: number[]
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(
    `/promotions/${id}/customer-exclusions`,
    { customer_ids }
  );
  return response.data;
};

export const createCondition = async (
  id: number,
  conditionData: {
    condition_type: string;
    applies_to_type: string;
    min_value: number;
    max_value?: number;
    effective_start_date?: string;
    effective_end_date?: string;
  }
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(
    `/promotions/${id}/conditions`,
    conditionData
  );
  return response.data;
};

export const updateCondition = async (
  id: number,
  conditionId: number,
  conditionData: any
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.put(
    `/promotions/${id}/conditions/${conditionId}`,
    conditionData
  );
  return response.data;
};

export const deleteCondition = async (
  id: number,
  conditionId: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(
    `/promotions/${id}/conditions/${conditionId}`
  );
  return response.data;
};

export const assignConditionProducts = async (
  id: number,
  conditionId: number,
  products: Array<{
    product_id?: number;
    category_id?: number;
    product_group?: string;
    condition_quantity: number;
  }>
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(
    `/promotions/${id}/conditions/${conditionId}/products`,
    { products }
  );
  return response.data;
};

export const createLevel = async (
  id: number,
  levelData: {
    level_number: number;
    threshold_value: number;
    discount_type?: string;
    discount_value: number;
  }
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(
    `/promotions/${id}/levels`,
    levelData
  );
  return response.data;
};

export const updateLevel = async (
  id: number,
  levelId: number,
  levelData: any
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.put(
    `/promotions/${id}/levels/${levelId}`,
    levelData
  );
  return response.data;
};

export const deleteLevel = async (
  id: number,
  levelId: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(
    `/promotions/${id}/levels/${levelId}`
  );
  return response.data;
};

export const createBenefit = async (
  id: number,
  levelId: number,
  benefitData: {
    benefit_type: string;
    product_id?: number;
    benefit_value: number;
    condition_type?: string;
    gift_limit?: number;
  }
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(
    `/promotions/${id}/levels/${levelId}/benefits`,
    benefitData
  );
  return response.data;
};

export const updateBenefit = async (
  id: number,
  levelId: number,
  benefitId: number,
  benefitData: any
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.put(
    `/promotions/${id}/levels/${levelId}/benefits/${benefitId}`,
    benefitData
  );
  return response.data;
};

export const deleteBenefit = async (
  id: number,
  levelId: number,
  benefitId: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(
    `/promotions/${id}/levels/${levelId}/benefits/${benefitId}`
  );
  return response.data;
};

export const activatePromotion = async (
  id: number
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.patch(`/promotions/${id}/activate`);
  return response.data;
};

export const deactivatePromotion = async (
  id: number
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.patch(`/promotions/${id}/deactivate`);
  return response.data;
};

export const calculateEligiblePromotions = async (data: {
  customer_id: number;
  order_lines: Array<{
    product_id: number;
    category_id?: number;
    product_group?: string;
    quantity: number;
    unit_price: number;
  }>;
  depot_id?: number;
  salesman_id?: number;
  route_id?: number;
  order_date?: string;
  platform?: string;
}): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post('/promotions/calculate', data);
  return response.data;
};

export const applyPromotion = async (data: {
  promotion_id: number;
  order_id?: number;
  customer_id: number;
  discount_amount?: number;
  free_products?: Array<any>;
}): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post('/promotions/apply', data);
  return response.data;
};

export const settlePeriodPromotion = async (
  id: number,
  data: {
    period_start: string;
    period_end: string;
    customer_ids: number[];
  }
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post(
    `/promotions/${id}/settle-period`,
    data
  );
  return response.data;
};

export const getActivePromotionsReport = async (params?: {
  platform?: string;
  depot_id?: number;
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.get('/promotions/reports/active', {
    params,
  });
  return response.data;
};

export const getPromotionTrackingReport = async (params?: {
  promotion_id?: number;
  action_type?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.get('/promotions/reports/tracking', {
    params,
  });
  return response.data;
};

export const getPromotionUsageReport = async (
  id: number,
  params?: {
    start_date?: string;
    end_date?: string;
  }
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.get(`/promotions/reports/usage/${id}`, {
    params,
  });
  return response.data;
};

export const getCustomerQualifiedReport = async (params?: {
  promotion_id: number;
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.get(
    '/promotions/reports/customer-qualified',
    { params }
  );
  return response.data;
};

export const getPromotionPerformanceReport = async (params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.get('/promotions/reports/performance', {
    params,
  });
  return response.data;
};

export default {
  fetchPromotions,
  fetchPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  assignChannels,
  assignDepots,
  assignSalespersons,
  assignRoutes,
  assignCustomerCategories,
  assignCustomerExclusions,
  createCondition,
  updateCondition,
  deleteCondition,
  assignConditionProducts,
  createLevel,
  updateLevel,
  deleteLevel,
  createBenefit,
  updateBenefit,
  deleteBenefit,
  activatePromotion,
  deactivatePromotion,
  calculateEligiblePromotions,
  applyPromotion,
  settlePeriodPromotion,
  getActivePromotionsReport,
  getPromotionTrackingReport,
  getPromotionUsageReport,
  getCustomerQualifiedReport,
  getPromotionPerformanceReport,
};

export type {
  GetPromotionsParams,
  CreatePromotionPayload,
  UpdatePromotionPayload,
  PaginationMeta,
  PromotionStats,
};
