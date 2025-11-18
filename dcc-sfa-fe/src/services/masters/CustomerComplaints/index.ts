/**
 * @fileoverview Customer Complaints Service with API Integration
 * @description Provides customer complaints CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface CustomerComplaint {
  id: number;
  customer_id: number;
  complaint_title: string;
  complaint_description: string;
  status: string;
  createdate: string | null;
  createdby: number;
  updatedate: string | null;
  updatedby: number | null;
  log_inst: number | null;
  customer?: {
    id: number;
    name: string;
    code: string;
  } | null;
  submitted_by_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface GetCustomerComplaintsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customer_id?: number;
}

export interface ManageCustomerComplaintPayload {
  customer_id: number;
  complaint_title: string;
  complaint_description: string;
  status?: string;
  submitted_by: number;
}

export interface UpdateCustomerComplaintPayload {
  customer_id?: number;
  complaint_title?: string;
  complaint_description?: string;
  status?: string;
  submitted_by?: number;
}

/**
 * Fetch customer complaints with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<CustomerComplaint[]>>
 */
export const fetchCustomerComplaints = async (
  params?: GetCustomerComplaintsParams
): Promise<ApiResponse<CustomerComplaint[]>> => {
  try {
    const response = await api.get('/customer-complaints', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer complaints:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch customer complaints'
    );
  }
};

/**
 * Fetch customer complaint by ID
 * @param id - Customer Complaint ID
 * @returns Promise<ApiResponse<CustomerComplaint>>
 */
export const fetchCustomerComplaintById = async (
  id: number
): Promise<ApiResponse<CustomerComplaint>> => {
  try {
    const response = await api.get(`/customer-complaints/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer complaint:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch customer complaint'
    );
  }
};

/**
 * Create customer complaint
 * @param complaintData - Customer complaint creation payload
 * @returns Promise<ApiResponse<CustomerComplaint>>
 */
export const createCustomerComplaint = async (
  complaintData: ManageCustomerComplaintPayload
): Promise<ApiResponse<CustomerComplaint>> => {
  try {
    const response = await api.post('/customer-complaints', complaintData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating customer complaint:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create customer complaint'
    );
  }
};

/**
 * Update customer complaint
 * @param id - Customer Complaint ID
 * @param complaintData - Customer complaint update payload
 * @returns Promise<ApiResponse<CustomerComplaint>>
 */
export const updateCustomerComplaint = async (
  id: number,
  complaintData: UpdateCustomerComplaintPayload
): Promise<ApiResponse<CustomerComplaint>> => {
  try {
    const response = await api.post('/customer-complaints', {
      id,
      ...complaintData,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating customer complaint:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update customer complaint'
    );
  }
};

/**
 * Delete customer complaint
 * @param id - Customer Complaint ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteCustomerComplaint = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/customer-complaints/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting customer complaint:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete customer complaint'
    );
  }
};
