/**
 * @fileoverview Import/Export Service
 * @description API service for import/export operations
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from 'configs/axio.config';
import type { ApiResponse } from 'types/api.types';

interface SupportedTable {
  name: string;
  displayName: string;
  count: number;
  columns: number;
}

interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    column: string;
    message: string;
    value: any;
  }>;
  preview: any[];
  fileInfo: {
    originalName: string;
    size: number;
    mimetype: string;
  };
  columns: Array<{
    key: string;
    header: string;
    type: string;
    required: boolean;
  }>;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  data: any[];
  totalProcessed: number;
  fileInfo: {
    originalName: string;
    rows: number;
  };
}

interface ImportOptions {
  batchSize?: number;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

/**
 * Get supported tables for import/export
 */
export const getSupportedTables = async (): Promise<
  ApiResponse<{
    tables: string[];
    details: SupportedTable[];
  }>
> => {
  try {
    const response = await api.get('/import-export/tables');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supported tables:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch supported tables'
    );
  }
};

/**
 * Download template for a specific table
 */
export const downloadTemplate = async (tableName: string): Promise<Blob> => {
  try {
    const response = await api.get(`/import-export/${tableName}/template`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    console.error('Error downloading template:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to download template'
    );
  }
};

/**
 * Preview import data before actual import
 */
export const previewImport = async (
  tableName: string,
  file: File
): Promise<ApiResponse<ImportPreview>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/import-export/${tableName}/preview`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error previewing import:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to preview import'
    );
  }
};

/**
 * Import data from file
 */
export const importData = async (
  tableName: string,
  file: File,
  options: ImportOptions = {}
): Promise<ApiResponse<ImportResult>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add options to form data
    if (options.batchSize)
      formData.append('batchSize', options.batchSize.toString());
    if (options.skipDuplicates !== undefined)
      formData.append('skipDuplicates', options.skipDuplicates.toString());
    if (options.updateExisting !== undefined)
      formData.append('updateExisting', options.updateExisting.toString());

    const response = await api.post(
      `/import-export/${tableName}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error importing data:', error);
    throw new Error(error.response?.data?.message || 'Failed to import data');
  }
};

/**
 * Export data to Excel
 */
export const exportToExcel = async (
  tableName: string,
  filters?: Record<string, any>
): Promise<Blob> => {
  try {
    const response = await api.get(`/import-export/${tableName}/export/excel`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting to Excel:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to export to Excel'
    );
  }
};

/**
 * Export data to PDF
 */
export const exportToPDF = async (
  tableName: string,
  filters?: Record<string, any>
): Promise<Blob> => {
  try {
    const response = await api.get(`/import-export/${tableName}/export/pdf`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting to PDF:', error);
    throw new Error(error.response?.data?.message || 'Failed to export to PDF');
  }
};

export type { SupportedTable, ImportPreview, ImportResult, ImportOptions };
