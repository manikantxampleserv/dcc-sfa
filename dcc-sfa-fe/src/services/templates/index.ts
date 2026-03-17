/**
 * @fileoverview Templates Service with API Integration
 * @description Provides templates CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface Template {
  id: number;
  name: string;
  key: string;
  channel?: string | null;
  type?: string | null;
  subject: string;
  body: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
}

interface ManageTemplatePayload {
  name: string;
  key: string;
  channel?: string;
  type?: string;
  subject: string;
  body: string;
  createdby?: number;
}

interface UpdateTemplatePayload {
  name?: string;
  key?: string;
  channel?: string;
  type?: string;
  subject?: string;
  body?: string;
  updatedby?: number;
}

interface GetTemplatesParams {
  page?: number;
  limit?: number;
  search?: string;
  channel?: string;
  type?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Fetch templates with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<Template[]>>
 */
export const fetchTemplates = async (
  params?: GetTemplatesParams
): Promise<ApiResponse<Template[]>> => {
  try {
    const response = await api.get('/templates', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch templates'
    );
  }
};

/**
 * Fetch template by ID
 * @param id - Template ID
 * @returns Promise<ApiResponse<Template>>
 */
export const fetchTemplateById = async (
  id: number
): Promise<ApiResponse<Template>> => {
  try {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching template:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch template'
    );
  }
};

/**
 * Create new template
 * @param templateData - Template creation payload
 * @returns Promise<ApiResponse<Template>>
 */
export const createTemplate = async (
  templateData: ManageTemplatePayload
): Promise<ApiResponse<Template>> => {
  try {
    const response = await api.post('/templates', templateData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating template:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create template'
    );
  }
};

/**
 * Update existing template
 * @param id - Template ID
 * @param templateData - Template update payload
 * @returns Promise<ApiResponse<Template>>
 */
export const updateTemplate = async (
  id: number,
  templateData: UpdateTemplatePayload
): Promise<ApiResponse<Template>> => {
  try {
    const response = await api.put(`/templates/${id}`, templateData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating template:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update template'
    );
  }
};

/**
 * Delete template
 * @param id - Template ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteTemplate = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting template:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete template'
    );
  }
};

export type {
  GetTemplatesParams,
  ManageTemplatePayload,
  UpdateTemplatePayload,
  PaginationMeta,
  Template,
};
