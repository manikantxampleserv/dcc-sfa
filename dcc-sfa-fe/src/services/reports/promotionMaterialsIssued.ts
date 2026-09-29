import axiosInstance from 'configs/axio.config';

export interface PromotionMaterialsIssuedReportFilters {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  depot_id?: number;
  outlet_id?: number;
  asset_id?: number;
  group_by?: 'outlet' | 'item' | 'depot' | 'month' | 'detailed';
}

export interface PromotionMaterialsIssuedReportData {
  summary: {
    total_expense: number;
    approved_issues: number;
    outlets_reached: number;
    pieces_issued: number;
  };
  data: any[];
}

export const fetchPromotionMaterialsIssuedReport = async (
  filters?: PromotionMaterialsIssuedReportFilters
): Promise<PromotionMaterialsIssuedReportData> => {
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
  if (filters?.outlet_id) {
    params.append('outlet_id', filters.outlet_id.toString());
  }
  if (filters?.asset_id) {
    params.append('asset_id', filters.asset_id.toString());
  }
  if (filters?.group_by) {
    params.append('group_by', filters.group_by);
  }

  const response = await axiosInstance.get(
    `/reports/promotion-materials-issued?${params.toString()}`
  );
  return response.data.data;
};

export const exportPromotionMaterialsIssuedReport = async (
  filters?: PromotionMaterialsIssuedReportFilters
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
    if (filters?.outlet_id) {
      params.append('outlet_id', filters.outlet_id.toString());
    }
    if (filters?.asset_id) {
      params.append('asset_id', filters.asset_id.toString());
    }
    if (filters?.group_by) {
      params.append('group_by', filters.group_by);
    }

    const response = await axiosInstance.get(
      `/reports/promotion-materials-issued/export?${params.toString()}`,
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
    link.download = `Promotion_Materials_Issued_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report to Excel:', error);
    throw error;
  }
};
