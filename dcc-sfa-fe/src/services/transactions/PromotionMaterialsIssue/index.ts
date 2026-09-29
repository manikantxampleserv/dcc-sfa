import axiosInstance from '../../../configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface PromotionMaterialsIssueItem {
  id: number;
  issue_id: number;
  asset_id: number;
  quantity: number;
  unit_value?: number | null;
  total_value?: number | null;
  asset?: {
    id: number;
    name: string;
    code?: string;
  };
}

export interface PromotionMaterialsIssue {
  id: number;
  gin_number: string;
  depot_id: number;
  outlet_id: number;
  issue_date: string;
  issued_by_id: number;
  total_value?: number | null;
  approval_status: 'P' | 'A' | 'R';
  campaign_reference?: string | null;
  notes?: string | null;
  is_active: string;
  createdate?: string | null;
  createdby: number;
  depot?: {
    id: number;
    name: string;
    code?: string;
  };
  outlet?: {
    id: number;
    name: string;
    code?: string;
  };
  issued_by?: {
    id: number;
    name: string;
    sap_code?: string;
    email: string;
  };
  items?: PromotionMaterialsIssueItem[];
}

export interface CreatePromotionMaterialsIssuePayload {
  depot_id: number;
  outlet_id: number;
  issue_date: string;
  issued_by_id: number;
  campaign_reference?: string;
  notes?: string;
  items: {
    asset_id: number;
    quantity: number;
    unit_value?: number;
    total_value?: number;
  }[];
}

export interface UpdatePromotionMaterialsIssuePayload {
  depot_id?: number;
  outlet_id?: number;
  issue_date?: string;
  issued_by_id?: number;
  campaign_reference?: string;
  notes?: string;
  items?: {
    id?: number; // for updates
    asset_id: number;
    quantity: number;
    unit_value?: number;
    total_value?: number;
  }[];
  approval_status?: 'P' | 'A' | 'R';
}

const BASE_URL = '/promotion-materials-issue';

export const getPromotionMaterialsIssues = async (
  page = 1,
  limit = 10,
  search = '',
  status = '',
  depot_id?: number
): Promise<ApiResponse<PromotionMaterialsIssue[]>> => {
  let url = `${BASE_URL}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  if (status) {
    url += `&status=${encodeURIComponent(status)}`;
  }
  if (depot_id) {
    url += `&depot_id=${depot_id}`;
  }

  const response =
    await axiosInstance.get<ApiResponse<PromotionMaterialsIssue[]>>(url);
  return response.data;
};

export const getPromotionMaterialsIssueById = async (
  id: number
): Promise<ApiResponse<PromotionMaterialsIssue>> => {
  const response = await axiosInstance.get<
    ApiResponse<PromotionMaterialsIssue>
  >(`${BASE_URL}/${id}`);
  return response.data;
};

export const createPromotionMaterialsIssue = async (
  data: CreatePromotionMaterialsIssuePayload
): Promise<ApiResponse<PromotionMaterialsIssue>> => {
  const response = await axiosInstance.post<
    ApiResponse<PromotionMaterialsIssue>
  >(BASE_URL, data);
  return response.data;
};

export const updatePromotionMaterialsIssue = async (
  id: number,
  data: UpdatePromotionMaterialsIssuePayload
): Promise<ApiResponse<PromotionMaterialsIssue>> => {
  const response = await axiosInstance.put<
    ApiResponse<PromotionMaterialsIssue>
  >(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deletePromotionMaterialsIssue = async (
  id: number
): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.delete<ApiResponse<null>>(
    `${BASE_URL}/${id}`
  );
  return response.data;
};
