import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface RouteType {
  id: number;
  name: string;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
}

/**
 * Fetch all route types
 * @returns Promise<ApiResponse<RouteType[]>>
 */
export const fetchRouteTypes = async (): Promise<ApiResponse<RouteType[]>> => {
  try {
    const response = await axiosInstance.get('/route-types');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching route types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch route types'
    );
  }
};
