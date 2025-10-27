import axiosInstance from 'configs/axio.config';

export interface CompetitorAnalysisFilters {
  start_date?: string;
  end_date?: string;
  customer_id?: number;
  brand_name?: string;
}

export interface CompetitorAnalysisData {
  summary: {
    total_observations: number;
    unique_brands: number;
    unique_customers: number;
    avg_visibility_score: number;
  };
  data: {
    activities: Array<{
      id: number;
      brand_name: string;
      product_name: string;
      customer_name: string;
      customer_address: string;
      observed_price: number;
      promotion_details: string;
      visibility_score: number;
      remarks: string;
      visit_date: string | null;
      visit_status: string;
    }>;
    brands_summary: Array<{
      brand_name: string;
      observation_count: number;
      avg_price: number;
      avg_visibility: number;
    }>;
  };
}

export const fetchCompetitorAnalysisReport = async (
  filters?: CompetitorAnalysisFilters
): Promise<CompetitorAnalysisData> => {
  const params = new URLSearchParams();

  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  if (filters?.customer_id) {
    params.append('customer_id', filters.customer_id.toString());
  }
  if (filters?.brand_name) {
    params.append('brand_name', filters.brand_name);
  }

  const response = await axiosInstance.get(
    `/reports/competitor-analysis?${params.toString()}`
  );

  return response.data.data;
};

export const exportCompetitorAnalysisReport = async (
  filters?: CompetitorAnalysisFilters
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.customer_id) {
      params.append('customer_id', filters.customer_id.toString());
    }
    if (filters?.brand_name) {
      params.append('brand_name', filters.brand_name);
    }

    const response = await axiosInstance.get(
      `/reports/competitor-analysis/export?${params.toString()}`,
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
    link.download = `Competitor_Analysis_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting report to Excel:', error);
    throw error;
  }
};

