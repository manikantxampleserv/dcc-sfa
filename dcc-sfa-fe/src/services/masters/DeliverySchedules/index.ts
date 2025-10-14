/**
 * @fileoverview Delivery Schedules Service with API Integration
 * @description Provides delivery schedules CRUD operations and type definitions
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface DeliverySchedule {
  id: number;
  order_id: number;
  customer_id: number;
  scheduled_date: string;
  scheduled_time_slot?: string | null;
  assigned_vehicle_id?: number | null;
  assigned_driver_id?: number | null;
  status?: string | null;
  priority?: string | null;
  delivery_instructions?: string | null;
  actual_delivery_time?: string | null;
  delivery_proof?: string | null;
  customer_signature?: string | null;
  failure_reason?: string | null;
  rescheduled_date?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  vehicle?: {
    id: number;
    vehicle_number: string;
    type: string;
  } | null;
  driver?: {
    id: number;
    name: string;
    email: string;
    profile_image: string;
  } | null;
  customer?: { id: number; name: string; code: string; type: string } | null;
  order?: { id: number; order_number: string } | null;
}

interface ManageDeliverySchedulePayload {
  order_id: number;
  customer_id: number;
  scheduled_date: string;
  scheduled_time_slot?: string;
  assigned_vehicle_id?: number;
  assigned_driver_id?: number;
  status?: string;
  priority?: string;
  delivery_instructions?: string;
  actual_delivery_time?: string;
  delivery_proof?: string;
  customer_signature?: string;
  failure_reason?: string;
  rescheduled_date?: string;
  is_active?: string;
  createdby?: number;
}

interface UpdateDeliverySchedulePayload {
  order_id?: number;
  customer_id?: number;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  assigned_vehicle_id?: number;
  assigned_driver_id?: number;
  status?: string;
  priority?: string;
  delivery_instructions?: string;
  actual_delivery_time?: string;
  delivery_proof?: string;
  customer_signature?: string;
  failure_reason?: string;
  rescheduled_date?: string;
  is_active?: string;
  updatedby?: number;
}

interface GetDeliverySchedulesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  isActive?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface DeliveryScheduleStats {
  total_deliveries: number;
  active_deliveries: number;
  inactive_deliveries: number;
  new_deliveries_this_month: number;
}

/**
 * Fetch delivery schedules with pagination and filters
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<ApiResponse<DeliverySchedule[]>>
 */
export const fetchDeliverySchedules = async (
  params?: GetDeliverySchedulesParams
): Promise<ApiResponse<DeliverySchedule[]>> => {
  try {
    const response = await api.get('/delivery-schedules', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching delivery schedules:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch delivery schedules'
    );
  }
};

/**
 * Fetch delivery schedule by ID
 * @param id - Delivery Schedule ID
 * @returns Promise<ApiResponse<DeliverySchedule>>
 */
export const fetchDeliveryScheduleById = async (
  id: number
): Promise<ApiResponse<DeliverySchedule>> => {
  try {
    const response = await api.get(`/delivery-schedules/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching delivery schedule:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch delivery schedule'
    );
  }
};

/**
 * Create new delivery schedule
 * @param deliveryScheduleData - Delivery schedule creation payload
 * @returns Promise<ApiResponse<DeliverySchedule>>
 */
export const createDeliverySchedule = async (
  deliveryScheduleData: ManageDeliverySchedulePayload
): Promise<ApiResponse<DeliverySchedule>> => {
  try {
    const response = await api.post(
      '/delivery-schedules',
      deliveryScheduleData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating delivery schedule:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create delivery schedule'
    );
  }
};

/**
 * Update existing delivery schedule
 * @param id - Delivery Schedule ID
 * @param deliveryScheduleData - Delivery schedule update payload
 * @returns Promise<ApiResponse<DeliverySchedule>>
 */
export const updateDeliverySchedule = async (
  id: number,
  deliveryScheduleData: UpdateDeliverySchedulePayload
): Promise<ApiResponse<DeliverySchedule>> => {
  try {
    const response = await api.put(
      `/delivery-schedules/${id}`,
      deliveryScheduleData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating delivery schedule:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update delivery schedule'
    );
  }
};

/**
 * Delete delivery schedule
 * @param id - Delivery Schedule ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteDeliverySchedule = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/delivery-schedules/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting delivery schedule:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete delivery schedule'
    );
  }
};

export type {
  GetDeliverySchedulesParams,
  ManageDeliverySchedulePayload,
  UpdateDeliverySchedulePayload,
  PaginationMeta,
  DeliverySchedule,
  DeliveryScheduleStats,
};
