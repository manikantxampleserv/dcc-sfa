import axioConfig from 'configs/axio.config';

export interface BatchLot {
  id: number;
  batch_number: string;
  lot_number?: string | null;
  manufacturing_date: string;
  expiry_date: string;
  quantity: number;
  remaining_quantity: number;
  supplier_name?: string | null;
  purchase_price?: number | null;
  quality_grade?: string | null;
  storage_location?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  updatedate?: string | null;
  updatedby?: number | null;
  log_inst?: number | null;
  products?: Array<{
    id: number;
    name: string;
    code: string;
    base_price?: number;
  }>;
  serial_numbers?: Array<{
    id: number;
    serial_number: string;
    status?: string;
    customer_id?: number | null;
    sold_date?: string | null;
  }>;
  stock_movements?: Array<{
    id: number;
    movement_type: string;
    quantity: number;
    movement_date: string;
  }>;
}

export interface BatchLotsResponse {
  success: boolean;
  message: string;
  data: BatchLot[];
  meta: {
    total_count: number;
    current_page: number;
    total_pages: number;
    per_page: number;
    requestDuration: number;
    timestamp: string;
  };
  stats?: {
    total_batch_lots: number;
    active_batch_lots: number;
    expiring_batch_lots: number;
    expired_batch_lots: number;
  };
}

export interface CreateBatchLotRequest {
  batch_number: string;
  lot_number?: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity: number;
  remaining_quantity?: number;
  supplier_name?: string;
  purchase_price?: number;
  quality_grade?: string;
  storage_location?: string;
  is_active?: string;
}

export interface UpdateBatchLotRequest extends Partial<CreateBatchLotRequest> {
  id: number;
}

export interface BatchLotsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  product_id?: number;
  expiring_soon?: boolean;
  expired?: boolean;
  quality_grade?: string;
}

export interface BatchLotDropdown {
  id: number;
  batch_number: string;
  lot_number?: string | null;
  remaining_quantity: number;
  quantity?: number;
  expiry_date: string;
  product_id: number;
}

export const batchLotsService = {
  async getBatchLots(
    params?: BatchLotsQueryParams
  ): Promise<BatchLotsResponse> {
    const response = await axioConfig.get('/batch-lots', { params });
    return response.data;
  },

  async getBatchLotById(id: number): Promise<{ data: BatchLot }> {
    const response = await axioConfig.get(`/batch-lots/${id}`);
    return response.data;
  },

  async fetchBatchLotById(id: number): Promise<{ data: BatchLot }> {
    const response = await axioConfig.get(`/batch-lots/${id}`);
    return response.data;
  },

  async createBatchLot(
    data: CreateBatchLotRequest
  ): Promise<{ data: BatchLot }> {
    const response = await axioConfig.post('/batch-lots', data);
    return response.data;
  },

  async updateBatchLot(
    data: UpdateBatchLotRequest
  ): Promise<{ data: BatchLot }> {
    const { id, ...updateData } = data;
    const response = await axioConfig.put(`/batch-lots/${id}`, updateData);
    return response.data;
  },

  async deleteBatchLot(id: number): Promise<{ message: string }> {
    const response = await axioConfig.delete(`/batch-lots/${id}`);
    return response.data;
  },

  async getBatchLotsDropdown(params?: {
    search?: string;
    batch_lot_id?: number;
  }): Promise<{ data: BatchLotDropdown[] }> {
    const response = await axioConfig.get('/batch-lots-dropdown', { params });
    return response.data;
  },
};
