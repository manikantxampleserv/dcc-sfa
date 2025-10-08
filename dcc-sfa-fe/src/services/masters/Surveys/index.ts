import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface SurveyField {
  id?: number;
  parent_id?: number;
  label: string;
  field_type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'time'
    | 'photo'
    | 'signature';
  options?: string | null;
  is_required?: boolean;
  sort_order?: number;
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
  fields?: SurveyField[];
}

interface ManageSurveyPayload {
  title: string;
  description?: string;
  category: string;
  target_roles?: string;
  is_published?: boolean;
  expires_at?: Date | string;
  is_active?: string;
  fields?: SurveyField[];
}

interface UpdateSurveyPayload {
  title?: string;
  description?: string;
  category?: string;
  target_roles?: string;
  is_published?: boolean;
  expires_at?: Date | string;
  is_active?: string;
  fields?: SurveyField[];
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
export const fetchSurveyById = async (
  id: number
): Promise<ApiResponse<Survey>> => {
  try {
    const response = await axiosInstance.get(`/surveys/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new survey
 */
export const createSurvey = async (
  surveyData: ManageSurveyPayload
): Promise<ApiResponse<Survey>> => {
  const response = await axiosInstance.post('/surveys', surveyData);
  return response.data;
};

/**
 * Update existing survey
 */
export const updateSurvey = async (
  id: number,
  surveyData: UpdateSurveyPayload
): Promise<ApiResponse<Survey>> => {
  const response = await axiosInstance.put(`/surveys/${id}`, surveyData);
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
  createSurvey,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
};

export type {
  GetSurveysParams,
  ManageSurveyPayload,
  UpdateSurveyPayload,
  Survey,
  SurveyField,
};
