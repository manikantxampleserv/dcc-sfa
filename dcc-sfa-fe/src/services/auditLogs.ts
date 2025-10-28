import axiosInstance from '../configs/axio.config';

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface AuditLogData {
  id: number;
  table_name: string;
  record_id: number;
  action: string;
  changed_data: any;
  changed_by: number;
  user_name: string;
  user_email: string;
  employee_id: string | null;
  changed_at: string;
  ip_address: string | null;
  device_info: string | null;
  session_id: string | null;
}

export interface AuditLogsResponse {
  logs: AuditLogData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  statistics: {
    total_logs: number;
    by_action: {
      CREATE: number;
      UPDATE: number;
      DELETE: number;
    };
    unique_tables: Array<{ table_name: string }>;
    unique_users: Array<{ changed_by: number }>;
    unique_tables_count: number;
    unique_users_count: number;
  };
}

/**
 * Fetch Audit Logs Data
 */
export const fetchAuditLogs = async (
  filters?: AuditLogFilters
): Promise<AuditLogsResponse> => {
  const params: any = {};
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.action) params.action = filters.action;
  if (filters?.user_id) params.user_id = filters.user_id;
  if (filters?.start_date) params.start_date = filters.start_date;
  if (filters?.end_date) params.end_date = filters.end_date;

  const response = await axiosInstance.get('/audit-logs', { params });
  return response.data.data;
};
