import api from 'configs/axio.config';

export interface BatchInfo {
  batch_lot_id: number;
  batch_number: string;
  lot_number: string;
  manufacturing_date: string;
  expiry_date: string;
  supplier_name: string;
  quality_grade: string;
  total_quantity: number;
  remaining_quantity: number;
  is_expired: boolean;
  is_expiring_soon: boolean;
  days_until_expiry: number;
  status: 'active' | 'expiring_soon' | 'expired';
}

export interface SerialInfo {
  serial_id: number;
  serial_number: string;
  status: string;
  warranty_expiry: string | null;
  warranty_expired: boolean;
  warranty_days_remaining: number | null;
  batch_id: number | null;
  batch: {
    id: number;
    batch_number: string;
    lot_number: string;
    expiry_date: string;
  } | null;
  customer_id: number | null;
  customer: {
    id: number;
    name: string;
    code: string;
  } | null;
  sold_date: string | null;
}

export interface VanEntry {
  van_inventory_id: number;
  van_inventory_status: string;
  van_inventory_loading_type: string;
  item_id: number;
  quantity: number;
  batch: BatchInfo | null;
}

export interface VanInventoryReference {
  van_inventory_id: number;
  document_date: string | null;
  status: string;
  loading_type: string;
}

export interface ProductInventory {
  product_id: number;
  product_name: string | null;
  product_code: string | null;
  unit_price: number | null;
  tracking_type: string;
  total_quantity: number;
  van_inventories: VanInventoryReference[];
  batches: BatchInfo[];
  serials: SerialInfo[];
}

export interface SalespersonSummary {
  salesperson_id: number;
  salesperson_name: string;
  salesperson_email: string;
  salesperson_phone: string | null;
  salesperson_profile_image: string | null;
  total_van_inventories: number;
  total_products: number;
  total_quantity: number;
  total_batches: number;
  total_serials: number;
}

export interface SalespersonInventoryData {
  salesperson_id: number;
  salesperson_name: string;
  salesperson_email: string;
  salesperson_phone: string | null;
  salesperson_profile_image: string | null;
  total_van_inventories: number;
  total_products: number;
  total_quantity: number;
  total_batches: number;
  total_serials: number;
  products: ProductInventory[];
}

export interface AllSalespersonsResponse {
  success: boolean;
  message: string;
  data: SalespersonSummary[];
  filters?: {
    document_date?: string | null;
    product_id?: string | number | null;
    batch_status?: string | null;
    serial_status?: string | null;
  };
  statistics: {
    total_salespersons: number;
    total_van_inventories: number;
    total_unique_products: number;
    total_quantity: number;
    total_batches: number;
    total_serials: number;
  };
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface SingleSalespersonResponse {
  success: boolean;
  message: string;
  data: SalespersonInventoryData;
  filters?: {
    document_date?: string | null;
    product_id?: string | number | null;
    batch_status?: string | null;
    serial_status?: string | null;
  };
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface GetSalespersonInventoryParams {
  page?: number;
  limit?: number;
  product_id?: number;
  include_expired_batches?: boolean;
  batch_status?: 'active' | 'expiring_soon' | 'expired';
  serial_status?: string;
}

export const fetchAllSalespersonsInventory = async (
  params?: GetSalespersonInventoryParams
): Promise<AllSalespersonsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.product_id !== undefined)
    queryParams.append('product_id', params.product_id.toString());
  if (params?.include_expired_batches !== undefined)
    queryParams.append(
      'include_expired_batches',
      params.include_expired_batches.toString()
    );
  if (params?.batch_status)
    queryParams.append('batch_status', params.batch_status);
  if (params?.serial_status)
    queryParams.append('serial_status', params.serial_status);

  const qs = queryParams.toString();
  const url = `/inventory-item-salesperson${qs ? `?${qs}` : ''}`;

  const response = await api.get(url);
  return response.data;
};

export const fetchSalespersonInventory = async (
  salespersonId: number,
  params?: GetSalespersonInventoryParams
): Promise<SingleSalespersonResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.product_id !== undefined)
    queryParams.append('product_id', params.product_id.toString());
  if (params?.include_expired_batches !== undefined)
    queryParams.append(
      'include_expired_batches',
      params.include_expired_batches.toString()
    );
  if (params?.batch_status)
    queryParams.append('batch_status', params.batch_status);
  if (params?.serial_status)
    queryParams.append('serial_status', params.serial_status);

  const qs = queryParams.toString();
  const url = `/inventory-item-salesperson/${salespersonId}${qs ? `?${qs}` : ''}`;

  const response = await api.get(url);
  return response.data;
};

import type { ApiResponse } from 'types/api.types';

export interface VanInventoryItem {
  id: number;
  parent_id: number;
  product_id: number;
  product_name?: string | null;
  quantity: number;
  unit_price?: number | string | null;
  discount_amount?: number | string | null;
  tax_amount?: number | string | null;
  total_amount?: number | string | null;
  notes?: string | null;
  batch_lot_id?: number | null;
  batch_number?: string | null;
  lot_number?: string | null;
  remaining_quantity?: number | null;
  total_quantity?: number | null;
  product_remaining_quantity?: number | null;
  batch_total_remaining_quantity?: number | null;
  unit?: string | null;
  expiry_date?: string | null;
}

export interface CreateVanInventoryItemPayload {
  product_id: number;
  quantity: number;
  unit_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string | null;
  batch_lot_id?: number | null;
  product_serials?: Array<string | { serial_number: string }>;
}

export interface UpdateVanInventoryItemPayload {
  product_id?: number;
  quantity?: number;
  unit_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string | null;
  batch_lot_id?: number | null;
  product_serials?: Array<string | { serial_number: string }>;
}

export interface BulkUpdateVanInventoryItemsPayload {
  vanInventoryItems: CreateVanInventoryItemPayload[];
}

export const getVanInventoryItems = async (
  vanInventoryId: number
): Promise<ApiResponse<VanInventoryItem[]>> => {
  const response = await api.get(`/van-inventory/${vanInventoryId}/items`);
  return response.data;
};

export const createVanInventoryItem = async (
  vanInventoryId: number,
  payload: CreateVanInventoryItemPayload
): Promise<ApiResponse<VanInventoryItem>> => {
  const response = await api.post(
    `/van-inventory/${vanInventoryId}/items`,
    payload
  );
  return response.data;
};

export const updateVanInventoryItem = async (
  vanInventoryId: number,
  itemId: number,
  payload: UpdateVanInventoryItemPayload
): Promise<ApiResponse<VanInventoryItem>> => {
  const response = await api.put(
    `/van-inventory/${vanInventoryId}/items/${itemId}`,
    payload
  );
  return response.data;
};

export const deleteVanInventoryItem = async (
  vanInventoryId: number,
  itemId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(
    `/van-inventory/${vanInventoryId}/items/${itemId}`
  );
  return response.data;
};

export const bulkUpdateVanInventoryItems = async (
  vanInventoryId: number,
  payload: BulkUpdateVanInventoryItemsPayload
): Promise<ApiResponse<VanInventoryItem[]>> => {
  const response = await api.put(
    `/van-inventory/${vanInventoryId}/items`,
    payload
  );
  return response.data;
};

export interface SalespersonInventoryItemDropdown {
  id: number;
  product_id: number;
  name: string;
  code: string;
  unit_price: number;
  tracking_type?: string | null;
}

export const fetchSalespersonInventoryItemsDropdown = async (
  salespersonId: number,
  search?: string
): Promise<ApiResponse<SalespersonInventoryItemDropdown[]>> => {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);

  const qs = queryParams.toString();
  const url = `/inventory-items-dropdown/${salespersonId}${qs ? `?${qs}` : ''}`;

  const response = await api.get(url);
  return response.data;
};
