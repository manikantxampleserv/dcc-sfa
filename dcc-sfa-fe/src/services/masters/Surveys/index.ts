import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface SurveyField {
  id?: number;
  parent_id?: number;
  label: string;
  field_type: 'text' | 'number' | 'checkbox' | 'radio' | 'date';
  options?: string | null;
  is_required?: boolean;
  sort_order?: number;
  parent_field_id?: number | null;
  parent_option_value?: string | null;
  child_fields?: SurveyField[];
}

interface Survey {
  id: number;
  title: string;
  description?: string | null;
  category:
    | 'cooler_inspection'
    | 'customer_feedback'
    | 'outlet_audit'
    | 'competitor_analysis'
    | 'brand_visibility'
    | 'general';
  target_roles?: string | null;
  roles?: { id: number; name: string; description: string } | null;
  is_published?: boolean | null;
  published_at?: Date | null;
  expires_at?: Date | null;
  response_count?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  is_matrix?: string;
  target_products?: number[];
  fields?: SurveyField[];
  depots?: number[];
  zones?: number[];
  routes?: number[];
  outlets?: number[];
  customer_types?: number[];
  customer_categories?: number[];
  customer_channels?: number[];
}

interface ManageSurveyPayload {
  id?: number;
  title: string;
  description?: string;
  category: string;
  target_roles?: number | string;
  is_published?: boolean;
  expires_at?: Date | string;
  is_active?: string;
  is_matrix?: string;
  target_products?: number[];
  fields?: SurveyField[];
  survey_fields?: SurveyField[];
  depots?: number[];
  zones?: number[];
  routes?: number[];
  outlets?: number[];
  customer_types?: number[];
  customer_categories?: number[];
  customer_channels?: number[];
}

interface GetSurveysParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  isPublished?: string;
}

/**
 * Fetch all surveys with pagination and filters
 */
export const fetchSurveys = async (
  params?: GetSurveysParams
): Promise<ApiResponse<Survey[]>> => {
  try {
    const response = await axiosInstance.get('/surveys', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch survey by ID
 */
export const fetchSurveyById = async (id: number): Promise<Survey> => {
  try {
    const response = await axiosInstance.get(`/surveys/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create or update survey (unified endpoint)
 * If id is provided and exists, updates the survey; otherwise creates a new one
 */
export const createOrUpdateSurvey = async (
  surveyData: ManageSurveyPayload
): Promise<ApiResponse<Survey>> => {
  const response = await axiosInstance.post('/surveys', surveyData);
  return response.data;
};

/**
 * Delete survey
 */
export const deleteSurvey = async (id: number): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/surveys/${id}`);
  return response.data;
};

/**
 * Publish/Unpublish survey
 */
export const publishSurvey = async (
  id: number
): Promise<ApiResponse<Survey>> => {
  const response = await axiosInstance.patch(`/surveys/${id}/publish`);
  return response.data;
};

export default {
  fetchSurveys,
  fetchSurveyById,
  createOrUpdateSurvey,
  deleteSurvey,
  publishSurvey,
};

export type { GetSurveysParams, ManageSurveyPayload, Survey, SurveyField };
