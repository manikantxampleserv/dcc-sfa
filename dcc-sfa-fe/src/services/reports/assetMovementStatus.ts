/**
 * Asset Movement/Status Report Service
 */

import axiosInstance from 'configs/axio.config';

export interface AssetMovementStatusFilters {
  start_date?: string;
  end_date?: string;
  asset_type_id?: number;
  asset_status?: string;
  customer_id?: number;
}

export interface AssetMovementStatusData {
  summary: {
    total_assets: number;
    total_movements: number;
    total_customer_assets: number;
    total_warranty_claims: number;
    assets_by_status: Record<string, number>;
    customer_assets_by_status: Record<string, number>;
    claims_by_status: Record<string, number>;
  };
  data: {
    assets: Array<{
      id: number;
      asset_type: string;
      category: string;
      brand: string;
      serial_number: string;
      purchase_date: string | null;
      warranty_expiry: string | null;
      current_location: string;
      current_status: string;
      assigned_to: string;
    }>;
    movements: Array<{
      id: number;
      asset_serial: string;
      asset_type: string;
      from_location: string;
      to_location: string;
      movement_type: string;
      movement_date: string;
      performed_by: string;
      performed_by_email: string;
      notes: string;
    }>;
    customer_assets: Array<{
      id: number;
      customer_name: string;
      customer_code: string;
      asset_type: string;
      category: string;
      brand: string;
      model: string;
      serial_number: string;
      capacity: number;
      install_date: string | null;
      status: string;
      last_scanned_date: string | null;
      technician_name: string;
      warranty_expiry: string | null;
    }>;
    warranty_claims: Array<{
      id: number;
      asset_serial: string;
      asset_type: string;
      claim_date: string;
      issue_description: string;
      claim_status: string;
      resolved_date: string | null;
      notes: string;
    }>;
  };
}

/**
 * Fetch Asset Movement/Status Report
 */
export const fetchAssetMovementStatusReport = async (
  filters?: AssetMovementStatusFilters
): Promise<AssetMovementStatusData> => {
  const params = new URLSearchParams();

  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  if (filters?.asset_type_id) {
    params.append('asset_type_id', filters.asset_type_id.toString());
  }
  if (filters?.asset_status) {
    params.append('asset_status', filters.asset_status);
  }
  if (filters?.customer_id) {
    params.append('customer_id', filters.customer_id.toString());
  }

  const response = await axiosInstance.get(
    `/reports/asset-movement-status?${params.toString()}`
  );

  return response.data.data;
};

/**
 * Export Asset Movement/Status Report to Excel
 */
export const exportAssetMovementStatusReport = async (
  filters?: AssetMovementStatusFilters
): Promise<void> => {
  try {
    const params = new URLSearchParams();

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters?.asset_type_id) {
      params.append('asset_type_id', filters.asset_type_id.toString());
    }
    if (filters?.asset_status) {
      params.append('asset_status', filters.asset_status);
    }
    if (filters?.customer_id) {
      params.append('customer_id', filters.customer_id.toString());
    }

    // Call the backend export endpoint
    const response = await axiosInstance.get(
      `/reports/asset-movement-status/export?${params.toString()}`,
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
    link.download = `Asset_Movement_Status_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
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
