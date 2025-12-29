/**
 * @fileoverview Van Inventory Items Service
 * @description API service for managing salesperson inventory items
 * @author DCC-SFA Team
 * @version 1.2.0
 */

import api from 'configs/axio.config';

// Batch information in van entries
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

// Serial information
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

// Van entry structure
export interface VanEntry {
  van_inventory_id: number;
  van_inventory_status: string;
  van_inventory_loading_type: string;
  item_id: number;
  quantity: number;
  batch: BatchInfo | null;
}

// Product structure for detailed view
export interface ProductInventory {
  product_id: number;
  product_name: string | null;
  product_code: string | null;
  tracking_type: string;
  total_quantity: number;
  van_entries: VanEntry[];
  batches: BatchInfo[];
  serials: SerialInfo[];
}

// Salesperson summary (for "all" view)
export interface SalespersonSummary {
  salesperson_id: number;
  salesperson_name: string;
  salesperson_email: string;
  salesperson_phone: string;
  salesperson_profile_image?: string;
  total_van_inventories: number;
  total_products: number;
  total_quantity: number;
  total_batches: number;
  total_serials: number;
}

// Detailed salesperson inventory
export interface SalespersonInventoryData {
  salesperson_id: number;
  salesperson_name: string;
  salesperson_email: string;
  salesperson_phone: string;
  salesperson_profile_image?: string;
  total_van_inventories: number;
  total_products: number;
  total_quantity: number;
  total_batches: number;
  total_serials: number;
  products: ProductInventory[];
}

// Response for all salespersons
export interface AllSalespersonsResponse {
  success: boolean;
  message: string;
  data: SalespersonSummary[];
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

// Response for single salesperson
export interface SingleSalespersonResponse {
  success: boolean;
  message: string;
  data: SalespersonInventoryData;
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

/**
 * Fetch all salespersons inventory summary
 * GET /inventory-item-salesperson
 */
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

/**
 * Fetch single salesperson inventory details
 * GET /inventory-item-salesperson/:salesperson_id
 */
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
