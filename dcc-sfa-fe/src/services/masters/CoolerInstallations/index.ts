import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface CoolerInstallation {
  id: number;
  customer_id: number;
  code: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  capacity?: number | null;
  install_date?: string | null;
  last_service_date?: string | null;
  next_service_due?: string | null;
  status?: string | null;
  temperature?: number | null;
  energy_rating?: string | null;
  warranty_expiry?: string | null;
  maintenance_contract?: string | null;
  technician_id?: number | null;
  last_scanned_date?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  customer?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  technician?: {
    id: number;
    name: string;
    email: string;
    profile_image?: string | null;
  } | null;
}

export interface CreateCoolerInstallationPayload {
  customer_id: number;
  code: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  capacity?: number;
  install_date?: string;
  last_service_date?: string;
  next_service_due?: string;
  status?: string;
  temperature?: number;
  energy_rating?: string;
  warranty_expiry?: string;
  maintenance_contract?: string;
  technician_id?: number;
  last_scanned_date?: string;
  is_active?: string;
}

export interface UpdateCoolerInstallationPayload {
  customer_id?: number;
  code?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  capacity?: number;
  install_date?: string;
  last_service_date?: string;
  next_service_due?: string;
  status?: string;
  temperature?: number;
  energy_rating?: string;
  warranty_expiry?: string;
  maintenance_contract?: string;
  technician_id?: number;
  last_scanned_date?: string;
  is_active?: string;
}

export interface CoolerInstallationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  status?: string;
  customer_id?: number;
  technician_id?: number | null;
}

export interface CoolerInstallationStats {
  total_coolers: number;
  active_coolers: number;
  inactive_coolers: number;
  new_coolers_this_month: number;
}

export const fetchCoolerInstallations = async (
  params?: CoolerInstallationQueryParams
): Promise<ApiResponse<CoolerInstallation[]>> => {
  try {
    const queryParams: any = { ...params };
    if (queryParams.technician_id === null) {
      queryParams.technician_id = 'null';
    }

    const response = await axiosInstance.get('/cooler-installations', {
      params: queryParams,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cooler installations:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler installations'
    );
  }
};

export const fetchCoolerInstallationById = async (
  id: number
): Promise<CoolerInstallation> => {
  try {
    const response = await axiosInstance.get(`/cooler-installations/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching cooler installation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cooler installation'
    );
  }
};

export const createCoolerInstallation = async (
  data: CreateCoolerInstallationPayload
): Promise<CoolerInstallation> => {
  try {
    const response = await axiosInstance.post('/cooler-installations', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating cooler installation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create cooler installation'
    );
  }
};

export const updateCoolerInstallation = async (
  id: number,
  data: UpdateCoolerInstallationPayload
): Promise<CoolerInstallation> => {
  try {
    const response = await axiosInstance.put(
      `/cooler-installations/${id}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating cooler installation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update cooler installation'
    );
  }
};

export const deleteCoolerInstallation = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/cooler-installations/${id}`);
  } catch (error: any) {
    console.error('Error deleting cooler installation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete cooler installation'
    );
  }
};

export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export const updateCoolerStatus = async (
  id: number,
  status: string,
  value: string
): Promise<{ message: string; data: CoolerInstallation }> => {
  try {
    const response = await axiosInstance.patch(
      `/cooler-installations/${id}/status`,
      { status, value }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating cooler status:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update cooler status'
    );
  }
};

export const fetchCoolerStatusOptions = async (): Promise<StatusOption[]> => {
  try {
    const response = await axiosInstance.get(
      '/cooler-installations/status-options'
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching status options:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch status options'
    );
  }
};
