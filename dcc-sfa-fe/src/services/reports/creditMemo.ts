import axiosInstance from 'configs/axio.config';

export interface CreditMemoReportFilters {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  depot_id?: number;
  salesman_sap_code?: string;
  status?: string;
  search?: string;
}

export interface CreditMemoLineItem {
  id: number;
  header_id: number;
  source_system: string;
  sap_docnum?: string | null;
  sap_docentry?: string | null;
  sap_lineid: string;
  product_sap_code: string;
  product_name?: string | null;
  product_code?: string | null;
  batch_number?: string | null;
  quantity?: number | string | null;
  base_quantity?: number | null;
  conversion_rate?: number | null;
  unit_case_conversion_rate?: number | null;
  sub_category_name?: string | null;
  category_name?: string | null;
  purchase_price?: number | string | null;
  total_amount?: number;
  quality_grade?: string | null;
  storage_location?: string | null;
  supplier_name?: string | null;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  status?: string | null;
  reconciliation_item_id?: number | null;
  createdate?: string | null;
}

export interface CreditMemoReportItem {
  id: number;
  batch_ref: string;
  salesman_sap_code: string;
  depot_sap_code?: string | null;
  document_date: string;
  status: string;
  reconciliation_id?: number | null;
  is_active: string;
  createdate?: string | null;
  salesman?: {
    id: number;
    name: string;
    employee_id?: string;
    sap_code?: string;
    email?: string;
  } | null;
  depot?: {
    id: number;
    name: string;
    code?: string;
    sap_code?: string;
  } | null;
  sap_docnums: string;
  total_lines: number;
  total_quantity: number;
  total_value: number;
  lines: CreditMemoLineItem[];
}

export interface CreditMemoReportData {
  summary: {
    total_credit_memos: number;
    approved_memos: number;
    pending_memos: number;
    rejected_memos: number;
    total_lines: number;
    total_quantity: number;
    total_value: number;
  };
  data: CreditMemoReportItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    total_count?: number;
    current_page?: number;
    total_pages?: number;
    has_next?: boolean;
    has_previous?: boolean;
  };
}

export interface CreditMemoDetailData extends CreditMemoReportItem {}

/**
 * Fetch Credit Memo Report with filters and pagination
 */
export const fetchCreditMemoReport = async (
  filters?: CreditMemoReportFilters
): Promise<CreditMemoReportData> => {
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
  if (filters?.depot_id) {
    params.append('depot_id', filters.depot_id.toString());
  }
  if (filters?.salesman_sap_code) {
    params.append('salesman_sap_code', filters.salesman_sap_code);
  }
  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const response = await axiosInstance.get(
    `/reports/credit-memo?${params.toString()}`
  );
  return response.data.data;
};

/**
 * Fetch Credit Memo Report Details by ID
 */
export const fetchCreditMemoReportById = async (
  id: number
): Promise<CreditMemoDetailData> => {
  const response = await axiosInstance.get(`/reports/credit-memo/${id}`);
  return response.data.data;
};

/**
 * Export Credit Memo Report to Excel
 */
export const exportCreditMemoReport = async (
  filters?: CreditMemoReportFilters
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.depot_id) {
      params.append('depot_id', filters.depot_id.toString());
    }
    if (filters?.salesman_sap_code) {
      params.append('salesman_sap_code', filters.salesman_sap_code);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await axiosInstance.get(
      `/reports/credit-memo/export?${params.toString()}`,
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
    link.download = `Credit_Memo_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting Credit Memo Report to Excel:', error);
    throw error;
  }
};
