import axiosInstance from '../configs/axio.config';

export interface MobileErrorLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  error_message?: string;
  error_type?: string;
  screen_name?: string;
  device_info?: string;
  user_id?: number;
  is_synced?: number;
  start_date?: string;
  end_date?: string;
}

export interface MobileErrorLogData {
  id: number;
  error_message: string;
  stack_trace: string | null;
  error_type: string | null;
  screen_name: string | null;
  device_info: string | null;
  user_id: number | null;
  user_name: string;
  user_email: string;
  employee_code: string;
  is_synced: number | null;
  createdate: string;
}

export interface MobileErrorLogsResponse {
  success: boolean;
  data: MobileErrorLogData[];
  stats?: {
    total_errors: number;
    today_errors: number;
    this_week_errors: number;
    this_month_errors: number;
  };
  pagination: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

/**
 * Fetch Mobile Error Logs Data
 */
export const fetchMobileErrorLogs = async (
  filters?: MobileErrorLogFilters
): Promise<MobileErrorLogsResponse> => {
  const params: any = {};
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.search) params.search = filters.search;
  if (filters?.error_message) params.error_message = filters.error_message;
  if (filters?.error_type && filters.error_type !== 'ALL') params.error_type = filters.error_type;
  if (filters?.screen_name && filters.screen_name !== 'ALL') params.screen_name = filters.screen_name;
  if (filters?.device_info) params.device_info = filters.device_info;
  if (filters?.user_id) params.user_id = filters.user_id;
  if (filters?.is_synced !== undefined) params.is_synced = filters.is_synced;
  if (filters?.start_date) params.start_date = filters.start_date;
  if (filters?.end_date) params.end_date = filters.end_date;

  const response = await axiosInstance.get('/mobile-error-logs', { params });
  return response.data;
};
