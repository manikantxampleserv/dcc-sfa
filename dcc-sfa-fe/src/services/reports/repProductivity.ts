import axiosInstance from 'configs/axio.config';

export interface RepProductivityFilters {
  start_date?: string;
  end_date?: string;
  salesperson_id?: number;
  depot_id?: number;
  zone_id?: number;
}

export interface RepProductivityData {
  summary: {
    total_reps: number;
    total_visits: number;
    completed_tasks: number;
    total_orders: number;
    total_order_value: number;
    total_collection: number;
  };
  data: {
    reps: Array<{
      id: number;
      name: string;
      email: string;
      employee_id: string;
      depot_name: string;
      zone_name: string;
      total_visits: number;
      completed_tasks: number;
      pending_tasks: number;
      total_orders: number;
      order_value: number;
      total_invoices: number;
      invoice_value: number;
      total_collection: number;
      total_returns: number;
      gps_tracking_points: number;
      days_active: number;
      avg_visit_duration: number;
      productivity_score: number;
    }>;
  };
}

export const fetchRepProductivityReport = async (
  filters?: RepProductivityFilters
): Promise<RepProductivityData> => {
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
  if (filters?.depot_id) {
    params.append('depot_id', filters.depot_id.toString());
  }
  if (filters?.zone_id) {
    params.append('zone_id', filters.zone_id.toString());
  }

  const response = await axiosInstance.get(
    `/reports/rep-productivity?${params.toString()}`
  );

  return response.data.data;
};

export const exportRepProductivityReport = async (
  filters?: RepProductivityFilters
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
    if (filters?.depot_id) {
      params.append('depot_id', filters.depot_id.toString());
    }
    if (filters?.zone_id) {
      params.append('zone_id', filters.zone_id.toString());
    }

    const response = await axiosInstance.get(
      `/reports/rep-productivity/export?${params.toString()}`,
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
    link.download = `Rep_Productivity_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report to Excel:', error);
    throw error;
  }
};
