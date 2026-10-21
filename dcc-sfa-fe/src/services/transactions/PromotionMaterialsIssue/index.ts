import axiosInstance from '../../../configs/axio.config';
import type { ApiResponse } from 'types/api.types';

export interface PromotionMaterialsIssueItem {
  id: number;
  issue_id: number;
  material_id?: number | null;
  asset_id?: number | null;
  quantity: number;
  unit_value?: number | null;
  total_value?: number | null;
  material?: {
    id: number;
    name: string;
    code: string;
    uom?: string;
  };
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
    address?: string;
    route?: {
      id?: number;
      name?: string;
      code?: string;
    };
    city?: {
      id?: number;
      name?: string;
    };
    [key: string]: any;
  };
  issued_by?: {
    id: number;
    name: string;
    sap_code?: string;
    email?: string;
  };
  approved_by?: {
    id: number;
    name: string;
    sap_code?: string;
    email?: string;
  } | null;
  approved_at?: string | null;
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
    material_id: number;
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
    id?: number;
    material_id: number;
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

/**
 * Fetches the Goods Issue Note HTML for printing or previewing.
 * @param id - Promotion Materials Issue ID
 */
export const getPromotionMaterialsIssueNoteHtml = async (
  id: number
): Promise<string> => {
  const response = await axiosInstance.get<string>(
    `${BASE_URL}/${id}/issue-note`,
    {
      headers: { Accept: 'text/html' },
      responseType: 'text',
    }
  );
  return response.data;
};

/**
 * Prints the Goods Issue Note HTML directly using a temporary hidden iframe without opening a new tab.
 * @param id - Promotion Materials Issue ID
 */
export const printPromotionMaterialsIssueNote = async (
  id: number
): Promise<void> => {
  const html = await getPromotionMaterialsIssueNoteHtml(id);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  }
};
