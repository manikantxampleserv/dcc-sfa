import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface City {
  id: number;
  district_id: number;
  name: string;
  code: string;
  description?: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  cities_districts?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

export interface ManageCityPayload {
  district_id: number;
  name: string;
  code?: string;
  description?: string;
  is_active?: string;
}

export interface UpdateCityPayload {
  district_id?: number;
  name?: string;
  code?: string;
  description?: string;
  is_active?: string;
}

export interface GetCitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
  district_id?: number;
}

export const fetchCities = async (
  params?: GetCitiesParams
): Promise<ApiResponse<City[]>> => {
  try {
    const response = await api.get('/cities', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cities:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch cities'
    );
  }
};

export const fetchCityById = async (
  id: number
): Promise<City> => {
  try {
    const response = await api.get(`/cities/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching city:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch city'
    );
  }
};

export const createCity = async (
  data: ManageCityPayload
): Promise<ApiResponse<City>> => {
  try {
    const response = await api.post('/cities', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating city:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create city'
    );
  }
};

export const updateCity = async (
  id: number,
  data: UpdateCityPayload
): Promise<ApiResponse<City>> => {
  try {
    const response = await api.put(`/cities/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating city:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update city'
    );
  }
};

export const deleteCity = async (id: number): Promise<void> => {
  try {
    await api.delete(`/cities/${id}`);
  } catch (error: any) {
    console.error('Error deleting city:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete city'
    );
  }
};
