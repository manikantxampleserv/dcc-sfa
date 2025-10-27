/**
 * Sales vs Target Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface SalesVsTargetFilters {
  start_date?: string;
  end_date?: string;
  salesperson_id?: number;
  product_category_id?: number;
  sales_target_group_id?: number;
}

export interface SalesVsTargetData {
  summary: {
    total_salespeople: number;
    total_categories: number;
    total_target_amount: number;
    total_actual_sales: number;
    achievement_percentage: number;
  };
  performance: Array<{
    salesperson_id: number;
    category_id: number;
    category_name: string;
    target_quantity: number;
    target_amount: number;
    actual_quantity: number;
    actual_sales: number;
    achievement_percentage: number;
    gap: number;
  }>;
  category_performance: Array<{
    category_id: number;
    category_name: string;
    target_amount: number;
    actual_sales: number;
    achievement_percentage: number;
    gap: number;
  }>;
}

/**
 * Fetch Sales vs Target Report
 */
export const fetchSalesVsTargetReport = async (
  filters?: SalesVsTargetFilters
): Promise<SalesVsTargetData> => {
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
  if (filters?.product_category_id) {
    params.append(
      'product_category_id',
      filters.product_category_id.toString()
    );
  }
  if (filters?.sales_target_group_id) {
    params.append(
      'sales_target_group_id',
      filters.sales_target_group_id.toString()
    );
  }

  const response = await axiosInstance.get(
    `/reports/sales-vs-target?${params.toString()}`
  );

  return response.data.data;
};

/**
 * Export Sales vs Target Report to Excel
 */
export const exportSalesVsTargetReport = async (
  filters?: SalesVsTargetFilters
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
    if (filters?.product_category_id) {
      params.append(
        'product_category_id',
        filters.product_category_id.toString()
      );
    }
    if (filters?.sales_target_group_id) {
      params.append(
        'sales_target_group_id',
        filters.sales_target_group_id.toString()
      );
    }

    // Call the backend export endpoint
    const response = await axiosInstance.get(
      `/reports/sales-vs-target/export?${params.toString()}`,
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
    link.download = `Sales_Vs_Target_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
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
