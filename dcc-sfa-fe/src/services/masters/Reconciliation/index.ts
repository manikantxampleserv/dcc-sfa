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
  saleQuantity?: number;
  saleValue?: number;
  expectedRop: number;
  actualRop: string;
  variance: number | null;
  resolutionAction: string;
  defaultOutletPostingQty: number;
  unloadAdjustmentQty: number;
  categoryName: string;
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
}

export interface SaveReconciliationPayload {
  items: Array<{
    id: number;
    actual_qty: number | null;
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
