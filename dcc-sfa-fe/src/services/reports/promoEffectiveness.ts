/**
 * Promo Effectiveness Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface PromoEffectivenessFilters {
  start_date?: string;
  end_date?: string;
  promotion_id?: number;
  depot_id?: number;
  zone_id?: number;
}

export interface PromoEffectivenessData {
  summary: {
    total_promotions: number;
    active_promotions: number;
    upcoming_promotions: number;
    expired_promotions: number;
    total_products: number;
    total_parameters: number;
    unique_customer_types: number;
    unique_depots: number;
    unique_zones: number;
  };
  data: {
    promotions: Array<{
      id: number;
      name: string;
      code: string;
      type: string;
      description: string;
      start_date: string;
      end_date: string;
      depot_name: string;
      zone_name: string;
      total_products: number;
      total_parameters: number;
      customer_types: string;
      is_active: string;
      status: string;
    }>;
    products: Array<{
      id: number;
      promotion_name: string;
      promotion_code: string;
      product_name: string;
      product_code: string;
      product_category_id: number | null;
    }>;
    parameters: Array<{
      id: number;
      promotion_name: string;
      promotion_code: string;
      param_name: string;
      param_type: string;
      param_value: string;
      param_category: string;
    }>;
  };
}

/**
 * Fetch Promo Effectiveness Report
 */
export const fetchPromoEffectivenessReport = async (
  filters?: PromoEffectivenessFilters
): Promise<PromoEffectivenessData> => {
  const params = new URLSearchParams();

  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  if (filters?.promotion_id) {
    params.append('promotion_id', filters.promotion_id.toString());
  }
  if (filters?.depot_id) {
    params.append('depot_id', filters.depot_id.toString());
  }
  if (filters?.zone_id) {
    params.append('zone_id', filters.zone_id.toString());
  }

  const response = await axiosInstance.get(
    `/reports/promo-effectiveness?${params.toString()}`
  );

  return response.data.data;
};

/**
 * Export Promo Effectiveness Report to Excel
 */
export const exportPromoEffectivenessReport = async (
  filters?: PromoEffectivenessFilters
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.promotion_id) {
      params.append('promotion_id', filters.promotion_id.toString());
    }
    if (filters?.depot_id) {
      params.append('depot_id', filters.depot_id.toString());
    }
    if (filters?.zone_id) {
      params.append('zone_id', filters.zone_id.toString());
    }

    // Call the backend export endpoint
    const response = await axiosInstance.get(
      `/reports/promo-effectiveness/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );

    // Create a blob from the response
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Promo_Effectiveness_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report to Excel:', error);
    throw error;
  }
};
