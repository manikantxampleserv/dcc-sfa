import axiosInstance from '../../configs/axio.config';

export const getSalesControlTowerData = async (params: any) => {
  const response = await axiosInstance.get('/sales-control-tower/dashboard', { params });
  return response.data;
};

/**
 * Downloads the flat sales Excel export from the backend.
 * Passes the same filters as the dashboard so the export matches what is shown.
 */
export const exportSalesControlTowerData = async (params: any): Promise<void> => {
  const response = await axiosInstance.get('/sales-control-tower/export', {
    params,
    responseType: 'blob',
  });

  // Build a filename from Content-Disposition header if present
  const disposition = response.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `Sales_Control_Tower_Export.xlsx`;

  // Create a temporary anchor to trigger the download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};