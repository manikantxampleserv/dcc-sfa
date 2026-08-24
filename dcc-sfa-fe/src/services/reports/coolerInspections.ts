/**
 * Cooler Inspections Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface CoolerInspectionsReportFilters {
  page?: number;
  limit?: number;
  barcode?: string;
  customer_name?: string;
  is_working?: string;
  action_required?: string;
  status?: string;
  inspector_id?: number;
  inspection_date?: string;
}

export interface CoolerInspectionsReportData {
  data: Array<{
    id: number;
    inspection_date: string;
    is_working: string;
    action_required: string;
    temperature: number | null;
    issues: string | null;
    coolers: {
      code: string;
      cooler_asset_master?: { barcode: string } | null;
      coolers_customers?: { name: string; code: string } | null;
    };
    users?: {
      name: string;
      employee_id: string;
    };
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
    total_inspections: number;
    working_coolers: number;
    not_working_coolers: number;
    action_required: number;
  };
}

/**
 * Fetch Cooler Inspections Report
 */
export const fetchCoolerInspectionsReport = async (
  filters?: CoolerInspectionsReportFilters
): Promise<CoolerInspectionsReportData> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.barcode) params.append('barcode', filters.barcode);
  if (filters?.customer_name)
    params.append('customer_name', filters.customer_name);
  if (filters?.is_working) params.append('is_working', filters.is_working);
  if (filters?.action_required)
    params.append('action_required', filters.action_required);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.inspector_id)
    params.append('inspector_id', filters.inspector_id.toString());
  if (filters?.inspection_date)
    params.append('inspection_date', filters.inspection_date);

  const response = await axiosInstance.get(
    `/reports/cooler-inspections?${params.toString()}`
  );

  return response.data;
};

/**
 * Export Cooler Inspections Report to Excel
 */
export const exportCoolerInspectionsReport = async (
  filters?: Omit<CoolerInspectionsReportFilters, 'page' | 'limit'>
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.barcode) params.append('barcode', filters.barcode);
    if (filters?.customer_name)
      params.append('customer_name', filters.customer_name);
    if (filters?.is_working) params.append('is_working', filters.is_working);
    if (filters?.action_required)
      params.append('action_required', filters.action_required);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.inspector_id)
      params.append('inspector_id', filters.inspector_id.toString());
    if (filters?.inspection_date)
      params.append('inspection_date', filters.inspection_date);

    const response = await axiosInstance.get(
      `/reports/cooler-inspections/export?${params.toString()}`,
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
    link.download = `Cooler_Inspections_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting cooler inspections report to Excel:', error);
    throw error;
  }
};
