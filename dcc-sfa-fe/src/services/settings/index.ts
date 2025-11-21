import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export interface Settings {
  id: number;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipcode?: string | null;
  phone_number?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  is_active: string;
  created_by?: number | null;
  updated_by?: number | null;
  log_inst?: number | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_username?: string | null;
  smtp_password?: string | null;
  currency_id?: number | null;
  created_date?: string;
  updated_date?: string;
  users?: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  depot_companies?: Array<{
    id: number;
    parent_id: number | null;
    name: string;
  }>;
}

export interface SettingsMeta {
  total_companies?: number;
  active_companies?: number;
  inactive_companies?: number;
  new_companies?: number;
}

export interface UpdateSettingsPayload {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  is_active?: string;
  log_inst?: number | null;
  smtp_host?: string;
  smtp_port?: number | null;
  smtp_username?: string;
  smtp_password?: string;
  currency_id?: number | null;
}

export const fetchSettings = async (): Promise<ApiResponse<Settings>> => {
  try {
    const response = await axiosInstance.get('/settings');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSettings = async (
  id: number,
  settingsData: UpdateSettingsPayload | FormData
): Promise<ApiResponse<Settings>> => {
  try {
    const response = await axiosInstance.put(`/settings/${id}`, settingsData, {
      headers:
        settingsData instanceof FormData
          ? {
              'Content-Type': 'multipart/form-data',
            }
          : {
              'Content-Type': 'application/json',
            },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
