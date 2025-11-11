import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface CoolerInspection {
  id: number;
  cooler_id: number;
  visit_id?: number | null;
  inspected_by: number;
  inspection_date?: string | null;
  temperature?: number | null;
  is_working: string;
  issues?: string | null;
  images?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  action_required: string;
  action_taken?: string | null;
  next_inspection_due?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  cooler?: {
    id: number;
    code: string;
    brand?: string | null;
    model?: string | null;
    serial_number?: string | null;
    capacity?: number | null;
    customer?: {
      id: number;
      name: string;
      code?: string | null;
    } | null;
  } | null;
  inspector?: {
    id: number;
    name: string;
    email: string;
    profile_image?: string | null;
  } | null;
  visit?: {
    id: number;
    visit_date?: string | null;
  } | null;
}

export interface CreateCoolerInspectionPayload {
  cooler_id: number;
  inspected_by: number;
  visit_id?: number;
  inspection_date?: string;
  temperature?: number;
  is_working?: string;
  issues?: string;
  images?: string;
  latitude?: number;
  longitude?: number;
  action_required?: string;
  action_taken?: string;
  next_inspection_due?: string;
  is_active?: string;
}

export interface UpdateCoolerInspectionPayload {
  cooler_id?: number;
  inspected_by?: number;
  visit_id?: number;
  inspection_date?: string;
  temperature?: number;
  is_working?: string;
  issues?: string;
  images?: string;
  latitude?: number;
  longitude?: number;
  action_required?: string;
  action_taken?: string;
  next_inspection_due?: string;
  is_active?: string;
}

export interface CoolerInspectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  isWorking?: string;
  actionRequired?: string;
  cooler_id?: number;
  inspected_by?: number;
  inspector_id?: number | null;
  visit_id?: number;
}

export interface CoolerInspectionStats {
  total_inspections: number;
  active_inspections: number;
  inactive_inspections: number;
  new_inspections_this_month: number;
}

export const fetchCoolerInspections = async (
  params?: CoolerInspectionQueryParams
): Promise<ApiResponse<CoolerInspection[]>> => {
  try {
    // Convert null inspector_id to string "null" for backend
    // Support both inspector_id and inspected_by (inspector_id takes precedence)
    const queryParams: any = { ...params };
    if (queryParams.inspector_id !== undefined) {
      if (queryParams.inspector_id === null) {
        queryParams.inspector_id = 'null';
      }
      // If inspector_id is provided, don't send inspected_by
      delete queryParams.inspected_by;
    }

    const response = await axiosInstance.get('/cooler-inspections', {
      params: queryParams,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cooler inspections:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler inspections'
    );
  }
};

export const fetchCoolerInspectionById = async (
  id: number
): Promise<CoolerInspection> => {
  try {
    const response = await axiosInstance.get(`/cooler-inspections/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching cooler inspection:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler inspection'
    );
  }
};

export const createCoolerInspection = async (
  data: CreateCoolerInspectionPayload
): Promise<CoolerInspection> => {
  try {
    const response = await axiosInstance.post('/cooler-inspections', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating cooler inspection:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create cooler inspection'
    );
  }
};

export const updateCoolerInspection = async (
  id: number,
  data: UpdateCoolerInspectionPayload
): Promise<{ message: string; data: CoolerInspection }> => {
  try {
    const response = await axiosInstance.put(`/cooler-inspections/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating cooler inspection:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update cooler inspection'
    );
  }
};

export const deleteCoolerInspection = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/cooler-inspections/${id}`);
  } catch (error: any) {
    console.error('Error deleting cooler inspection:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete cooler inspection'
    );
  }
};

export interface StatusOption {
  field: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
    color: string;
  }>;
}

export const updateCoolerInspectionStatus = async (
  id: number,
  status: string,
  value: string
): Promise<{ message: string; data: CoolerInspection }> => {
  try {
    const response = await axiosInstance.patch(
      `/cooler-inspections/${id}/status`,
      { status, value }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating cooler inspection status:', error);
    throw new Error(
      error.response?.data?.message ||
        'Failed to update cooler inspection status'
    );
  }
};

export const fetchCoolerInspectionStatusOptions = async (): Promise<
  StatusOption[]
> => {
  try {
    const response = await axiosInstance.get(
      '/cooler-inspections/status-options'
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching status options:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch status options'
    );
  }
};
