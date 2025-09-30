/**
 * @fileoverview Import/Export React Query Hooks
 * @description Custom hooks for import/export operations with React Query
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  downloadTemplate,
  exportToExcel,
  exportToPDF,
  getSupportedTables,
  importData,
  previewImport,
  type ImportOptions,
  type ImportPreview,
  type ImportResult,
  type SupportedTable,
} from '../services/import-export';
import { useApiMutation } from './useApiMutation';

// Query Keys
export const importExportKeys = {
  all: ['import-export'] as const,
  tables: () => [...importExportKeys.all, 'tables'] as const,
  preview: (tableName: string, fileHash: string) =>
    [...importExportKeys.all, 'preview', tableName, fileHash] as const,
};

/**
 * Hook to fetch supported tables
 */
export const useSupportedTables = () => {
  return useQuery({
    queryKey: importExportKeys.tables(),
    queryFn: getSupportedTables,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to download template
 */
export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: async (tableName: string) => {
      const blob = await downloadTemplate(tableName);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}_template_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Template downloaded successfully' };
    },
    onError: (error: any) => {
      console.error('Template download failed:', error);
    },
  });
};

/**
 * Hook to preview import data
 */
export const usePreviewImport = () => {
  return useApiMutation({
    mutationFn: ({ tableName, file }: { tableName: string; file: File }) =>
      previewImport(tableName, file),
    loadingMessage: 'Analyzing file...',
  });
};

/**
 * Hook to import data
 */
export const useImportData = (options?: {
  onSuccess?: (
    data: any,
    variables: { tableName: string; file: File; options?: ImportOptions }
  ) => void;
  onError?: (
    error: any,
    variables: { tableName: string; file: File; options?: ImportOptions }
  ) => void;
}) => {
  return useApiMutation({
    mutationFn: ({
      tableName,
      file,
      options: importOptions,
    }: {
      tableName: string;
      file: File;
      options?: ImportOptions;
    }) => importData(tableName, file, importOptions),
    loadingMessage: 'Importing data...',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to export to Excel
 */
export const useExportToExcel = () => {
  return useMutation({
    mutationFn: async ({
      tableName,
      filters,
    }: {
      tableName: string;
      filters?: Record<string, any>;
    }) => {
      const blob = await exportToExcel(tableName, filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}_export_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Data exported to Excel successfully' };
    },
    onError: (error: any) => {
      console.error('Excel export failed:', error);
    },
  });
};

/**
 * Hook to export to PDF
 */
export const useExportToPDF = () => {
  return useMutation({
    mutationFn: async ({
      tableName,
      filters,
    }: {
      tableName: string;
      filters?: Record<string, any>;
    }) => {
      const blob = await exportToPDF(tableName, filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}_export_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Data exported to PDF successfully' };
    },
    onError: (error: any) => {
      console.error('PDF export failed:', error);
    },
  });
};

export type { SupportedTable, ImportPreview, ImportResult, ImportOptions };
