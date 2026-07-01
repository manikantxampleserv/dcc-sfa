import axiosInstance from '../configs/axio.config';

export interface ErrorLogFilters {
  page?: number;
  limit?: number;
  path?: string;
  method?: string;
  start_date?: string;
  end_date?: string;
}

export interface ErrorLogData {
  id: number;
  message: string;
  stack: string | null;
  path: string;
  method: string;
  body: any;
  query: any;
  user_id: number | null;
  user_name: string;
  user_email: string;
  createdate: string;
  ip_address?: string;
  device_info?: string;
  location?: string;
}

export interface ErrorLogsResponse {
  success: boolean;
  data: ErrorLogData[];
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
 * Fetch Error Logs Data
 */
export const fetchErrorLogs = async (
  filters?: ErrorLogFilters
): Promise<ErrorLogsResponse> => {
  const params: any = {};
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.path) params.path = filters.path;
  if (filters?.method) params.method = filters.method;
  if (filters?.start_date) params.start_date = filters.start_date;
  if (filters?.end_date) params.end_date = filters.end_date;
  const response = await axiosInstance.get('/error-logs', { params });
  return response.data;
};
