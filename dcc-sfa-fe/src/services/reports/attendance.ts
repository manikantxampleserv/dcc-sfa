/**
 * Attendance History Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface AttendanceHistoryReportFilters {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  user_id?: number;
  action_type?: string;
  search?: string;
}

export interface AttendanceHistoryReportData {
  data: Array<{
    id: number;
    attendance_id: number;
    action_type: string;
    action_time: string | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    device_info: any;
    photo_url: string | null;
    old_data: any;
    new_data: any;
    ip_address: string | null;
    user_agent: string | null;
    app_version: string | null;
    battery_level: number | null;
    network_type: string | null;
    remarks: string | null;
    createdate: string | null;
    createdby: number;
    attendance: {
      id: number;
      user_id: number;
      attendance_date: string | null;
      user: {
        id: number;
        name: string;
        email: string;
        employee_id: string | null;
        profile_image: string | null;
      } | null;
    } | null;
  }>;
  meta: {
    requestDuration: number;
    timestamp: string;
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
  };
  stats: {
    total_history_records: number;
    punch_in_count: number;
    punch_out_count: number;
    history_this_month: number;
  };
}

/**
 * Fetch Attendance History Report
 */
export const fetchAttendanceHistoryReport = async (
  filters?: AttendanceHistoryReportFilters
): Promise<AttendanceHistoryReportData> => {
  const params = new URLSearchParams();

  if (filters?.page) {
    params.append('page', filters.page.toString());
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  if (filters?.user_id) {
    params.append('user_id', filters.user_id.toString());
  }
  if (filters?.action_type) {
    params.append('action_type', filters.action_type);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const response = await axiosInstance.get(
    `/reports/attendance-history?${params.toString()}`
  );

  return response.data;
};

/**
 * Export Attendance History Report to Excel
 */
export const exportAttendanceHistoryReport = async (
  filters?: Omit<AttendanceHistoryReportFilters, 'page' | 'limit'>
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.user_id) {
      params.append('user_id', filters.user_id.toString());
    }
    if (filters?.action_type) {
      params.append('action_type', filters.action_type);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await axiosInstance.get(
      `/reports/attendance-history/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_History_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting attendance history report to Excel:', error);
    throw error;
  }
};
