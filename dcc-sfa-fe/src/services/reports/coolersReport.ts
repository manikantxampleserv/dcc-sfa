/**
 * Coolers Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface CoolersReportFilters {
  page?: number;
  limit?: number;
  barcode?: string;
  customer_name?: string;
  is_working?: string;
  status?: string;
  inspector_id?: number;
  inspection_date?: string;
}

export interface CoolersReportData {
  data: Array<{
    id: number;
    name: string;
    code: string;
    barcode: string;
    serial_number: string;
    asset_type: string;
    asset_sub_type: string;
    brand: string;
    current_location: string;
    is_active: string;
    current_status: string;
    install_date: string | null;
    cooler_code: string | null;
    cooler_status: string | null;
    cooler_type: string | null;
    cooler_sub_type: string | null;
    customer: {
      id?: number;
      name: string;
      code: string | null;
      type?: 'outlet' | 'depot' | 'other';
    } | null;
    inspection_date: string | null;
    temperature: number | null;
    is_working: string | null;
    action_required: string | null;
    inspector: {
      id: number;
      name: string;
      employee_id: string | null;
      email: string | null;
    } | null;
    technician: {
      id: number;
      name: string;
      employee_id: string | null;
      email: string | null;
    } | null;
  }>;
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
  };
  stats: {
    total: number;
    deployed: number;
    working: number;
    action_required: number;
  };
}

/**
 * Fetch Coolers Report
 */
export const fetchCoolersReport = async (
  filters?: CoolersReportFilters
): Promise<CoolersReportData> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.barcode) params.append('barcode', filters.barcode);
  if (filters?.customer_name)
    params.append('customer_name', filters.customer_name);
  if (filters?.is_working) params.append('is_working', filters.is_working);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.inspector_id)
    params.append('inspector_id', filters.inspector_id.toString());
  if (filters?.inspection_date)
    params.append('inspection_date', filters.inspection_date);

  const response = await axiosInstance.get(
    `/reports/coolers?${params.toString()}`
  );

  return response.data;
};

/**
 * Export Coolers Report to Excel
 */
export const exportCoolersReport = async (
  filters?: Omit<CoolersReportFilters, 'page' | 'limit'>
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.barcode) params.append('barcode', filters.barcode);
    if (filters?.customer_name)
      params.append('customer_name', filters.customer_name);
    if (filters?.is_working) params.append('is_working', filters.is_working);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.inspector_id)
      params.append('inspector_id', filters.inspector_id.toString());
    if (filters?.inspection_date)
      params.append('inspection_date', filters.inspection_date);

    const response = await axiosInstance.get(
      `/reports/coolers/export?${params.toString()}`,
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
    link.download = `Coolers_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting coolers report to Excel:', error);
    throw error;
  }
};
