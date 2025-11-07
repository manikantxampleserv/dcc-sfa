import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface RouteType {
  id: number;
  name: string;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

export interface CreateRouteTypePayload {
  name: string;
  is_active?: string;
}

export interface UpdateRouteTypePayload {
  name?: string;
  is_active?: string;
}

export interface RouteTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface RouteTypeStats {
  total_route_types: number;
  active_route_types: number;
  inactive_route_types: number;
  route_types_this_month: number;
}

export const fetchRouteTypes = async (
  params?: RouteTypeQueryParams
): Promise<ApiResponse<RouteType[]>> => {
  try {
    const response = await axiosInstance.get('/route-types', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching route types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch route types'
    );
  }
};

export const fetchRouteTypeById = async (id: number): Promise<RouteType> => {
  try {
    const response = await axiosInstance.get(`/route-types/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching route type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch route type'
    );
  }
};

export const createRouteType = async (
  data: CreateRouteTypePayload
): Promise<RouteType> => {
  try {
    const response = await axiosInstance.post('/route-types', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating route type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create route type'
    );
  }
};

export const updateRouteType = async (
  id: number,
  data: UpdateRouteTypePayload
): Promise<RouteType> => {
  try {
    const response = await axiosInstance.put(`/route-types/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating route type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update route type'
    );
  }
};

export const deleteRouteType = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/route-types/${id}`);
  } catch (error: any) {
    console.error('Error deleting route type:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete route type'
    );
  }
};
