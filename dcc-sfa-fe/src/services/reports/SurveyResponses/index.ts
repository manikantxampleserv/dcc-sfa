import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

interface SurveyAnswer {
  id: number;
  parent_id: number;
  field_id: number;
  answer?: string | null;
  product_id?: number | null;
  product?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  field?: {
    id: number;
    name: string;
    type: string;
    parent_option_value?: string | null;
    parent_field_id?: number | null;
    is_required?: boolean | string | null;
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
  customer_id?: number | null;
  survey?: {
    id: number;
    title: string;
    category?: string | null;
    description?: string | null;
    is_matrix?: string;
    fields?: Array<{
      id: number;
      label: string;
      field_type?: string | null;
    }>;
  } | null;
  submitted_user?: {
    id: number;
    name: string;
    email: string;
    employee_id?: string | null;
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
  customer_id?: number;
  response_id?: number;
  time_filter?: string;
  start_date?: string;
  end_date?: string;
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

/**
 * Export survey responses to Excel in flat table format
 *
 * @param {GetSurveyResponsesParams} [params]
 * @returns {Promise<void>}
 */
export const exportSurveyResponsesReport = async (
  params?: GetSurveyResponsesParams
): Promise<void> => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.survey_id)
    queryParams.append('survey_id', params.survey_id.toString());
  if (params?.submitted_by)
    queryParams.append('submitted_by', params.submitted_by.toString());
  if (params?.customer_id)
    queryParams.append('customer_id', params.customer_id.toString());
  if (params?.response_id)
    queryParams.append('response_id', params.response_id.toString());
  if (params?.time_filter) queryParams.append('time_filter', params.time_filter);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const response = await axiosInstance.get(
    `/survey-responses/export?${queryParams.toString()}`,
    { responseType: 'blob' }
  );

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `survey_responses_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default {
  fetchSurveyResponses,
  fetchSurveyResponseById,
  createOrUpdateSurveyResponse,
  deleteSurveyResponse,
  exportSurveyResponsesReport,
};

export type {
  GetSurveyResponsesParams,
  CreateOrUpdateSurveyResponsePayload,
  SurveyResponse,
  SurveyAnswer,
};
