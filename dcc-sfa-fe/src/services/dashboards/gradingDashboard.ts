import api from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export interface GradingStats {
  pending: number;
  changed: number;
  retained: number;
  pending_upgrades: number;
  pending_downgrades: number;
  total_upgrades: number;
  total_downgrades: number;
  rejected_upgrades: number;
  rejected_downgrades: number;
  total_customers_with_categories: number;
  category_distribution: {
    categoryId: number;
    categoryName: string;
    customerCount: number;
  }[];
  all_categories: {
    id: number;
    category_name: string;
  }[];
}

export interface PendingGradingRequest {
  id: number;
  customer_id: number;
  current_category_id: number;
  upcoming_category_id: number;
  change_type: 'upgrade' | 'downgrade';
  status: 'P' | 'C' | 'R';
  action_taken: 'A' | 'R' | 'N';
  createdate: string;
  notes: string | null;
  reason: string | null;
  category_grading_customers: {
    id: number;
    name: string;
    code: string;
  };
}

export interface ProcessGradingPayload {
  requestId: number;
  action: 'approve' | 'reject';
  notes?: string;
}

/**
 * Fetch grading dashboard statistics
 */
export const getGradingStats = async (): Promise<GradingStats> => {
  const response = await api.get('/customerCategoryGrading/stats/summary');
  return response.data.data;
};

/**
 * Fetch pending grading requests
 */
export const getPendingGradingRequests = async (params: {
  page?: number;
  limit?: number;
  change_type?: 'all' | 'upgrade' | 'downgrade';
  search?: string;
}): Promise<ApiResponse<PendingGradingRequest[]>> => {
  const { change_type, search, ...restParams } = params;
  const queryParams: Record<string, any> = {
    ...restParams,
  };

  if (change_type && change_type !== 'all') {
    queryParams.change_type = change_type;
  }

  if (search) {
    queryParams.search = search;
  }
  const response = await api.get<ApiResponse<PendingGradingRequest[]>>(
    '/customerCategoryGrading/pending',
    {
      params: queryParams,
    }
  );
  return response.data;
};

/**
 * Process a grading request
 */
export const processGradingRequest = async ({
  requestId,
  action,
  notes,
}: ProcessGradingPayload): Promise<ApiResponse<PendingGradingRequest>> => {
  const response = await api.put<ApiResponse<PendingGradingRequest>>(
    `/customerCategoryGrading/${requestId}/process`,
    {
      action,
      notes,
    }
  );
  return response.data;
};
