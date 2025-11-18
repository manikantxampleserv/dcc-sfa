import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface SurveyAnswer {
  id: number;
  parent_id: number;
  field_id: number;
  answer?: string | null;
  field?: {
    id: number;
    name: string;
    type: string;
  } | null;
}

interface SurveyResponse {
  id: number;
  parent_id: number;
  submitted_by: number;
  submitted_at?: Date | null;
  location?: string | null;
  photo_url?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  survey?: {
    id: number;
    name: string;
    description?: string | null;
  } | null;
  submitted_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  customer?: {
    id: number;
    name: string;
    code: string;
    type?: string | null;
    contact_person?: string | null;
    phone_number?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
    outstanding_amount: number;
    credit_limit: number;
    is_active: string;
  } | null;
  survey_response_customer?: {
    id: number;
    name: string;
    code: string;
    type?: string | null;
    contact_person?: string | null;
    phone_number?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
    outstanding_amount: number;
    credit_limit: number;
    is_active: string;
  } | null;
  answers?: SurveyAnswer[] | null;
}

interface CreateOrUpdateSurveyResponsePayload {
  id?: number;
  parent_id: number;
  submitted_by: number;
  submitted_at?: Date | string;
  location?: string | null;
  photo_url?: string | null;
  is_active?: string;
  survey_answers?: Array<{
    id?: number;
    field_id: number;
    answer?: string | null;
  }>;
  answers?: Array<{
    id?: number;
    field_id: number;
    answer?: string | null;
  }>;
}

interface GetSurveyResponsesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  survey_id?: number;
  submitted_by?: number;
}

/**
 * Fetch all survey responses with pagination and filters
 */
export const fetchSurveyResponses = async (
  params?: GetSurveyResponsesParams
): Promise<ApiResponse<SurveyResponse[]>> => {
  try {
    const response = await axiosInstance.get('/survey-responses', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch survey response by ID
 */
export const fetchSurveyResponseById = async (
  id: number
): Promise<SurveyResponse> => {
  try {
    const response = await axiosInstance.get(`/survey-responses/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create or update survey response (unified endpoint)
 */
export const createOrUpdateSurveyResponse = async (
  responseData: CreateOrUpdateSurveyResponsePayload
): Promise<ApiResponse<SurveyResponse>> => {
  const response = await axiosInstance.post('/survey-responses', responseData);
  return response.data;
};

/**
 * Delete survey response
 */
export const deleteSurveyResponse = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/survey-responses/${id}`);
  return response.data;
};

export default {
  fetchSurveyResponses,
  fetchSurveyResponseById,
  createOrUpdateSurveyResponse,
  deleteSurveyResponse,
};

export type {
  GetSurveyResponsesParams,
  CreateOrUpdateSurveyResponsePayload,
  SurveyResponse,
  SurveyAnswer,
};
