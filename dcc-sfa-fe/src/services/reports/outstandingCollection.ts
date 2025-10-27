import axiosInstance from 'configs/axio.config';

export interface OutstandingCollectionFilters {
  start_date?: string;
  end_date?: string;
  customer_id?: number;
  invoice_status?: string;
}

export interface OutstandingCollectionData {
  summary: {
    total_outstanding_amount: number;
    total_outstanding_invoices: number;
    total_customers_with_outstanding: number;
    total_collections: number;
    total_collection_count: number;
    avg_days_overdue: number;
  };
  data: {
    outstanding_invoices: Array<{
      id: number;
      invoice_number: string;
      invoice_date: string;
      due_date: string;
      customer_name: string;
      customer_code: string;
      salesperson_name: string;
      order_number: string;
      total_amount: number;
      amount_paid: number;
      balance_due: number;
      status: string;
      days_overdue: number;
    }>;
    customer_summary: Array<{
      customer_name: string;
      customer_code: string;
      invoice_count: number;
      total_outstanding: number;
      avg_days_overdue: number;
    }>;
    collections: Array<{
      id: number;
      payment_number: string;
      payment_date: string;
      customer_name: string;
      customer_code: string;
      collected_by: string;
      amount: number;
      method: string;
      reference_number: string;
    }>;
  };
}

export const fetchOutstandingCollectionReport = async (
  filters?: OutstandingCollectionFilters
): Promise<OutstandingCollectionData> => {
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
  if (filters?.invoice_status) {
    params.append('invoice_status', filters.invoice_status);
  }

  const response = await axiosInstance.get(
    `/reports/outstanding-collection?${params.toString()}`
  );

  return response.data.data;
};

export const exportOutstandingCollectionReport = async (
  filters?: OutstandingCollectionFilters
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
    if (filters?.invoice_status) {
      params.append('invoice_status', filters.invoice_status);
    }

    const response = await axiosInstance.get(
      `/reports/outstanding-collection/export?${params.toString()}`,
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
    link.download = `Outstanding_Collection_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report to Excel:', error);
    throw error;
  }
};
