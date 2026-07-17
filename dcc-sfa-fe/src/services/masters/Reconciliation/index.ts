import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

/** One row in the list — represents a single salesman load */
export interface ReconciliationRecord {
  id: number;
  salesman_id: number;
  salesmanName: string;
  salesmanSapCode: string;
  salesmanEmail: string;
  depot: string;
  depot_id: number | null;
  depotName: string;
  reconciliation_date: string | null;
  status: string;
  totalItems: number;
  pendingItems: number;
  matchedItems: number;
  overallStatus: string;
  createdate?: string | null;
}

/** One row in the detail view — represents one loaded product */
export interface ReconciliationItem {
  taxAmount?: number | string;
  id: number;
  reconciliation_id: number;
  salesman_id: number;
  salesmanName: string;
  salesmanSapCode: string;
  depot: string;
  depot_id: number | null;
  product_id: number;
  skuCode: string;
  skuName: string;
  batchNumber: string;
  loadQuantity?: number;
  loadBaseQty?: number;
  saleQuantity?: number;
  saleBaseQty?: number;
  saleValue?: number;
  expectedRop: number;
  expectedBaseQty: number;
  actualRop: string;
  actualBaseQty: string;
  variance: number | null;
  varianceBaseQty: number | null;
  resolutionAction: string;
  defaultOutletPostingQty: number;
  defaultOutletPostingBaseQty: number;
  unloadAdjustmentQty: number;
  unloadAdjustmentBaseQty: number;
  conversionRate: number;
  subUnit: string;
  categoryName: string;
  subCategoryName?: string;
  basePrice: number;
  stockKey: string;
  status: string;
  createdate?: string | null;
}

export interface GetReconciliationParams {
  page?: number;
  limit?: number;
  search?: string;
  salesman_id?: number;
  depot_id?: number;
  date?: string;
  status?: string;
  rec_status?: string;
  latest_only?: boolean;
}

export interface SaveReconciliationPayload {
  items: Array<{
    id: number;
    actual_qty: number | null;
    actual_base_qty: number | null;
  }>;
}

/** Fetch paginated list of reconciliations (one per salesman load) */
export const fetchReconciliations = async (
  params?: GetReconciliationParams
): Promise<ApiResponse<ReconciliationRecord[]>> => {
  try {
    const response = await api.get('/reconciliation', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching reconciliations:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch reconciliations'
    );
  }
};

/** Fetch items (loaded products) for a specific reconciliation by ID */
export const fetchReconciliationById = async (
  id: number
): Promise<ApiResponse<ReconciliationItem[]>> => {
  try {
    const response = await api.get(`/reconciliation/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching reconciliation by ID:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch reconciliation items'
    );
  }
};

/** Save reconciliation items */
export const saveReconciliations = async (
  payload: SaveReconciliationPayload
): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post('/reconciliation/save', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error saving reconciliations:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to save reconciliations'
    );
  }
};

/** Export settlement sheet to Excel */
export const exportReconciliationExcel = async ({
  id,
  salesmanName,
  currency,
}: {
  id: number;
  salesmanName?: string;
  currency?: string;
}): Promise<any> => {
  try {
    const response = await api.get(`/reconciliation/${id}/export`, {
      responseType: 'blob',
      params: { currency },
    });

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timeStamp = new Date()
      .toISOString()
      .replace(/T/, '_')
      .replace(/:/g, '-')
      .split('.')[0];
    a.download = `Settlement_Sheet_${salesmanName || id}_${timeStamp}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { message: 'Settlement sheet exported successfully!' };
  } catch (error: any) {
    console.error('Error exporting reconciliation:', error);
    throw new Error('Failed to export Excel file');
  }
};

/** Export settlement sheet to PDF */
export const exportReconciliationPdf = async ({
  id,
  salesmanName,
  currency,
}: {
  id: number;
  salesmanName?: string;
  currency?: string;
}): Promise<any> => {
  try {
    const response = await api.get(`/reconciliation/${id}/export`, {
      responseType: 'blob',
      params: { currency, format: 'pdf' },
    });

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timeStamp = new Date()
      .toISOString()
      .replace(/T/, '_')
      .replace(/:/g, '-')
      .split('.')[0];
    a.download = `Settlement_Sheet_${salesmanName || id}_${timeStamp}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return { message: 'Settlement sheet exported to PDF successfully!' };
  } catch (error: any) {
    console.error('Error exporting reconciliation to PDF:', error);
    throw new Error('Failed to export PDF file');
  }
};
