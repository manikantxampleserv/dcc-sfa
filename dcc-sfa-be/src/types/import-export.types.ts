export interface ColumnDefinition {
  key: string;
  header: string;
  width?: number;
  required?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'email';
  validation?: (value: any) => boolean | string;
  transform?: (value: any) => any;
  defaultValue?: any;
  description?: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  data?: any[];
  detailedErrors?: Array<{
    row: number;
    errors: Array<{
      type: string;
      message: string;
      action?: string;
    }>;
  }>;
}

export interface ExportOptions {
  filters?: any;
  include?: any;
  orderBy?: any;
  select?: any;
  limit?: number;
}

export interface ParseResult {
  data: any[];
  errors: Array<{ row: number; column: string; message: string }>;
  validCount: number;
  totalCount: number;
}

export interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  onProgress?: (progress: number) => void;
}

export interface FileInfo {
  originalName: string;
  size: number;
  mimetype: string;
}
