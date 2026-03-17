import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../types/api.types';

export interface ColumnPreferences {
  [columnName: string]: boolean;
}

export interface UserPreference {
  route: string;
  preferences: ColumnPreferences;
  updatedate: string;
}

export const fetchAllUserPreferences = async (): Promise<
  ApiResponse<UserPreference[]>
> => {
  const response =
    await axiosInstance.get<ApiResponse<UserPreference[]>>(
      '/column-preference'
    );
  return response.data;
};

export const saveUserColumnPreferences = async (payload: {
  route: string;
  preferences: ColumnPreferences;
}): Promise<ApiResponse<ColumnPreferences>> => {
  const response = await axiosInstance.post<ApiResponse<ColumnPreferences>>(
    '/column-preference',
    payload
  );
  return response.data;
};
