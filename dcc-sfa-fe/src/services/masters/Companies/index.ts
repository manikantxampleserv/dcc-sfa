/**
 * @fileoverview Company Service
 * @description API service for company management operations
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from '../../../configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

/**
 * Company interface
 */
export interface Company {
  id: number;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  logo?: string;
  is_active: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  users?: any[];
  depot_companies?: any[];
}

/**
 * Company creation/update payload
 */
export interface ManageCompanyPayload {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  is_active: string;
  created_by?: number;
}

/**
 * Query parameters for fetching companies
 */
export interface GetCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
}

/**
 * Fetch all companies with pagination and filters
 */
export const fetchCompanies = async (
  params?: GetCompaniesParams
): Promise<ApiResponse<Company[]>> => {
  const response = await api.get('/company', { params });
  return response.data;
};

/**
 * Fetch a single company by ID
 */
export const fetchCompanyById = async (
  id: number
): Promise<ApiResponse<Company>> => {
  const response = await api.get(`/company/${id}`);
  return response.data;
};

/**
 * Create a new company
 */
export const createCompany = async (
  companyData: ManageCompanyPayload | FormData
): Promise<ApiResponse<Company>> => {
  const response = await api.post('/company', companyData, {
    headers:
      companyData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined,
  });
  return response.data;
};

/**
 * Update an existing company
 */
export const updateCompany = async (
  id: number,
  companyData: ManageCompanyPayload | FormData
): Promise<ApiResponse<Company>> => {
  const response = await api.put(`/company/${id}`, companyData, {
    headers:
      companyData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined,
  });
  return response.data;
};

/**
 * Delete a company
 */
export const deleteCompany = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/company/${id}`);
  return response.data;
};
