export interface FieldError {
  field: string;
  value?: any;
  message: string;
  type:
    | 'validation'
    | 'missing'
    | 'foreign_key'
    | 'duplicate'
    | 'transform'
    | 'unknown';
}

export interface RowError {
  row: number;
  errors: FieldError[];
}

export interface ImportError {
  type: 'file' | 'header' | 'data' | 'system';
  message: string;
  details?: any;
}

export interface UniversalErrorResponse {
  success: false;
  message: string;
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    totalErrors: number;
  };
  errors: {
    file?: ImportError[];
    headers?: ImportError[];
    rows?: RowError[];
  };
  fieldSummary?: {
    [fieldName: string]: {
      errorCount: number;
      errorTypes: string[];
      examples: any[];
    };
  };
}

export interface ParseResultWithErrors {
  data: any[];
  errors: UniversalErrorResponse | null;
  validCount: number;
  totalCount: number;
  hasErrors: boolean;
}
