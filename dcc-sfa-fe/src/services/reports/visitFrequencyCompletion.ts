/**
 * Visit Frequency/Completion Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface VisitFrequencyCompletionFilters {
  start_date?: string;
  end_date?: string;
  salesperson_id?: number;
  customer_id?: number;
  status?: string;
}

export interface VisitFrequencyCompletionData {
  summary: {
    total_visits: number;
    completed_visits: number;
    in_progress_visits: number;
    planned_visits: number;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    avg_duration_minutes: number;
    total_orders_created: number;
    total_amount_collected: number;
    completion_rate: number;
    gps_logs_count: number;
  };
  data: {
    visits: Array<{
      id: number;
      customer_name: string;
      customer_code: string;
      salesperson_name: string;
      salesperson_email: string;
      route_name: string;
      zone_name: string;
      visit_date: string;
      visit_time: string;
      purpose: string;
      status: string;
      start_time: string | null;
      end_time: string | null;
      duration_minutes: number;
      check_in_time: string | null;
      check_out_time: string | null;
      orders_created: number;
      amount_collected: number;
      visit_notes: string;
      customer_feedback: string;
      next_visit_date: string | null;
      total_tasks: number;
      completed_tasks: number;
      completion_rate: number;
    }>;
    tasks: Array<{
      id: number;
      customer_name: string;
      visit_date: string;
      task_type: string;
      description: string;
      assigned_to: number | null;
      due_date: string | null;
      completed_date: string | null;
      status: string;
      priority: string;
    }>;
    gps_logs: Array<{
      id: number;
      user_name: string;
      user_email: string;
      latitude: number;
      longitude: number;
      log_time: string;
      accuracy_meters: number;
      speed_kph: number;
      battery_level: number;
      network_type: string;
    }>;
  };
}

/**
 * Fetch Visit Frequency/Completion Report
 */
export const fetchVisitFrequencyCompletionReport = async (
  filters?: VisitFrequencyCompletionFilters
): Promise<VisitFrequencyCompletionData> => {
  const params = new URLSearchParams();

  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  if (filters?.salesperson_id) {
    params.append('salesperson_id', filters.salesperson_id.toString());
  }
  if (filters?.customer_id) {
    params.append('customer_id', filters.customer_id.toString());
  }
  if (filters?.status) {
    params.append('status', filters.status);
  }

  const response = await axiosInstance.get(
    `/reports/visit-frequency-completion?${params.toString()}`
  );

  return response.data.data;
};

/**
 * Export Visit Frequency/Completion Report to Excel
 */
export const exportVisitFrequencyCompletionReport = async (
  filters?: VisitFrequencyCompletionFilters
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.salesperson_id) {
      params.append('salesperson_id', filters.salesperson_id.toString());
    }
    if (filters?.customer_id) {
      params.append('customer_id', filters.customer_id.toString());
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    // Call the backend export endpoint
    const response = await axiosInstance.get(
      `/reports/visit-frequency-completion/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );

    // Create a blob from the response
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Visit_Frequency_Completion_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report to Excel:', error);
    throw error;
  }
};
