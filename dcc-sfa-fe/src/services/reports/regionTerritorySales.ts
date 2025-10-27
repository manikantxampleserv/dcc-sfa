/**
 * Region/Territory Sales Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface RegionTerritorySalesFilters {
  start_date?: string;
  end_date?: string;
  zone_id?: number;
  depot_id?: number;
  route_id?: number;
}

export interface RegionTerritorySalesData {
  summary: {
    total_zones: number;
    total_customers: number;
    total_routes: number;
    total_orders: number;
    total_order_value: number;
    total_invoices: number;
    total_invoice_value: number;
    total_collection: number;
  };
  data: {
    zones: Array<{
      id: number;
      name: string;
      code: string;
      description: string;
      depot_name: string;
      customer_count: number;
      route_count: number;
      visit_count: number;
      total_orders: number;
      total_order_value: number;
      total_invoices: number;
      total_invoice_value: number;
      total_collection: number;
      routes: Array<{
        route_id: number;
        route_name: string;
        route_code: string;
        salesperson_name: string;
        customers: number;
        orders: number;
        order_value: number;
        invoices: number;
        invoice_value: number;
      }>;
    }>;
  };
}

/**
 * Fetch Region/Territory Sales Report
 */
export const fetchRegionTerritorySalesReport = async (
  filters?: RegionTerritorySalesFilters
): Promise<RegionTerritorySalesData> => {
  const params = new URLSearchParams();

  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  if (filters?.zone_id) {
    params.append('zone_id', filters.zone_id.toString());
  }
  if (filters?.depot_id) {
    params.append('depot_id', filters.depot_id.toString());
  }
  if (filters?.route_id) {
    params.append('route_id', filters.route_id.toString());
  }

  const response = await axiosInstance.get(
    `/reports/region-territory-sales?${params.toString()}`
  );

  return response.data.data;
};

/**
 * Export Region/Territory Sales Report to Excel
 */
export const exportRegionTerritorySalesReport = async (
  filters?: RegionTerritorySalesFilters
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.zone_id) {
      params.append('zone_id', filters.zone_id.toString());
    }
    if (filters?.depot_id) {
      params.append('depot_id', filters.depot_id.toString());
    }
    if (filters?.route_id) {
      params.append('route_id', filters.route_id.toString());
    }

    const response = await axiosInstance.get(
      `/reports/region-territory-sales/export?${params.toString()}`,
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
    link.download = `Region_Territory_Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report to Excel:', error);
    throw error;
  }
};
