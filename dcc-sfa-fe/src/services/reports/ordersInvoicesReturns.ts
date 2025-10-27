/**
 * Orders, Invoices, Returns Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  customer_id?: number;
  status?: string;
}

export interface ReportData {
  summary: {
    total_orders: number;
    total_invoices: number;
    total_returns: number;
    total_order_value: number;
    total_invoice_value: number;
  };
  status_breakdown: {
    pending_orders: number;
    completed_orders: number;
    pending_invoices: number;
    paid_invoices: number;
    pending_returns: number;
    completed_returns: number;
  };
  statistics: {
    average_order_value: number;
    average_invoice_value: number;
    conversion_rate: number;
    return_rate: number;
  };
  data: {
    orders: Array<{
      id: number;
      order_number: string;
      customer_name: string;
      customer_code: string;
      salesperson: string;
      order_date: string;
      status: string;
      total_amount: number;
      priority: string;
    }>;
    invoices: Array<{
      id: number;
      invoice_number: string;
      customer_name: string;
      customer_code: string;
      invoice_date: string;
      due_date: string;
      status: string;
      total_amount: number;
      balance_due: number;
      amount_paid: number;
    }>;
    returns: Array<{
      id: number;
      customer_name: string;
      customer_code: string;
      product_name: string;
      return_date: string;
      reason: string;
      status: string;
    }>;
  };
}

/**
 * Fetch Orders, Invoices, and Returns Report
 */
export const fetchOrdersInvoicesReturnsReport = async (
  filters?: ReportFilters
): Promise<ReportData> => {
  const params = new URLSearchParams();

  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  if (filters?.customer_id) {
    params.append('customer_id', filters.customer_id.toString());
  }
  if (filters?.status) {
    params.append('status', filters.status);
  }

  const response = await axiosInstance.get(
    `/reports/orders-invoices-returns?${params.toString()}`
  );

  return response.data.data;
};

/**
 * Export Orders, Invoices, and Returns Report to Excel
 */
export const exportOrdersInvoicesReturnsReport = async (
  filters?: ReportFilters
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.customer_id) {
      params.append('customer_id', filters.customer_id.toString());
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    // Call the backend export endpoint
    const response = await axiosInstance.get(
      `/reports/orders-invoices-returns/export?${params.toString()}`,
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
    link.download = `Orders_Invoices_Returns_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
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
