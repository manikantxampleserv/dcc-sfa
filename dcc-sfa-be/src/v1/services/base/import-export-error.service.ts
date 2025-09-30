import {
  FieldError,
  RowError,
  ImportError,
  UniversalErrorResponse,
  ParseResultWithErrors,
} from '../../../types/import-export-errors.types';
import { ColumnDefinition } from '../../../types/import-export.types';

export class ImportExportErrorHandler {
  private rowErrors: Map<number, FieldError[]> = new Map();
  private fileErrors: ImportError[] = [];
  private headerErrors: ImportError[] = [];
  private totalRows: number = 0;
  private validRows: number = 0;

  constructor(private columns: ColumnDefinition[]) {}

  addFieldError(
    row: number,
    field: string,
    message: string,
    type: FieldError['type'] = 'validation',
    value?: any
  ): void {
    if (!this.rowErrors.has(row)) {
      this.rowErrors.set(row, []);
    }

    this.rowErrors.get(row)!.push({
      field,
      value,
      message,
      type,
    });
  }

  addFileError(message: string, details?: any): void {
    this.fileErrors.push({
      type: 'file',
      message,
      details,
    });
  }

  addHeaderError(message: string, details?: any): void {
    this.headerErrors.push({
      type: 'header',
      message,
      details,
    });
  }

  checkMissingFields(row: any, rowNum: number): void {
    this.columns.forEach(column => {
      if (column.required) {
        const value = row[column.header];
        if (value === undefined || value === null || value === '') {
          this.addFieldError(
            rowNum,
            column.header,
            `${column.header} is required and cannot be empty`,
            'missing',
            null
          );
        }
      }
    });
  }

  validateField(value: any, column: ColumnDefinition, rowNum: number): boolean {
    if (!column.required && (!value || value === '')) {
      return true;
    }

    switch (column.type) {
      case 'number':
        if (value && isNaN(Number(value))) {
          this.addFieldError(
            rowNum,
            column.header,
            `${column.header} must be a valid number`,
            'validation',
            value
          );
          return false;
        }
        break;

      case 'email':
        if (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            this.addFieldError(
              rowNum,
              column.header,
              `${column.header} must be a valid email address`,
              'validation',
              value
            );
            return false;
          }
        }
        break;

      case 'date':
        if (value && isNaN(Date.parse(value))) {
          this.addFieldError(
            rowNum,
            column.header,
            `${column.header} must be a valid date (YYYY-MM-DD format recommended)`,
            'validation',
            value
          );
          return false;
        }
        break;

      case 'boolean':
        if (value) {
          const boolValues = ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'];
          if (!boolValues.includes(value.toString().toLowerCase())) {
            this.addFieldError(
              rowNum,
              column.header,
              `${column.header} must be a boolean value (Y/N, Yes/No, True/False, or 1/0)`,
              'validation',
              value
            );
            return false;
          }
        }
        break;
    }

    if (column.validation && value) {
      const validationResult = column.validation(value);
      if (validationResult !== true) {
        this.addFieldError(
          rowNum,
          column.header,
          typeof validationResult === 'string'
            ? validationResult
            : `${column.header} validation failed`,
          'validation',
          value
        );
        return false;
      }
    }

    return true;
  }

  transformField(value: any, column: ColumnDefinition, rowNum: number): any {
    try {
      if (
        column.transform &&
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        return column.transform(value);
      }

      // Default transformations
      if (value !== undefined && value !== null && value !== '') {
        switch (column.type) {
          case 'number':
            return Number(value);
          case 'date':
            return new Date(value);
          case 'boolean':
            const boolValue = value.toString().toLowerCase();
            return ['true', '1', 'yes', 'y'].includes(boolValue);
          default:
            return value.toString().trim();
        }
      }

      return column.defaultValue !== undefined ? column.defaultValue : value;
    } catch (error) {
      this.addFieldError(
        rowNum,
        column.header,
        `Failed to transform value: ${error}`,
        'transform',
        value
      );
      throw error;
    }
  }

  setTotalRows(count: number): void {
    this.totalRows = count;
  }

  setValidRows(count: number): void {
    this.validRows = count;
  }

  hasErrors(): boolean {
    return (
      this.fileErrors.length > 0 ||
      this.headerErrors.length > 0 ||
      this.rowErrors.size > 0
    );
  }

  private generateFieldSummary(): Record<string, any> {
    const fieldSummary: Record<string, any> = {};

    this.rowErrors.forEach(errors => {
      errors.forEach(error => {
        if (!fieldSummary[error.field]) {
          fieldSummary[error.field] = {
            errorCount: 0,
            errorTypes: new Set<string>(),
            examples: [],
          };
        }

        fieldSummary[error.field].errorCount++;
        fieldSummary[error.field].errorTypes.add(error.type);

        if (
          fieldSummary[error.field].examples.length < 3 &&
          error.value !== undefined
        ) {
          fieldSummary[error.field].examples.push(error.value);
        }
      });
    });

    Object.keys(fieldSummary).forEach(field => {
      fieldSummary[field].errorTypes = Array.from(
        fieldSummary[field].errorTypes
      );
    });

    return fieldSummary;
  }

  buildErrorResponse(customMessage?: string): UniversalErrorResponse {
    const rowErrorsArray: RowError[] = Array.from(this.rowErrors.entries()).map(
      ([row, errors]) => ({
        row,
        errors,
      })
    );

    const totalErrors =
      this.fileErrors.length +
      this.headerErrors.length +
      rowErrorsArray.reduce((sum, row) => sum + row.errors.length, 0);

    const response: UniversalErrorResponse = {
      success: false,
      message: customMessage || this.generateErrorMessage(totalErrors),
      summary: {
        totalRows: this.totalRows,
        validRows: this.validRows,
        errorRows: this.rowErrors.size,
        totalErrors,
      },
      errors: {},
      fieldSummary: this.generateFieldSummary(),
    };

    if (this.fileErrors.length > 0) {
      response.errors.file = this.fileErrors;
    }

    if (this.headerErrors.length > 0) {
      response.errors.headers = this.headerErrors;
    }

    if (rowErrorsArray.length > 0) {
      response.errors.rows = rowErrorsArray.sort((a, b) => a.row - b.row);
    }

    return response;
  }

  private generateErrorMessage(totalErrors: number): string {
    if (this.fileErrors.length > 0) {
      return `File validation failed: ${this.fileErrors[0].message}`;
    }

    if (this.headerErrors.length > 0) {
      return `Invalid file structure: ${this.headerErrors[0].message}`;
    }

    if (this.rowErrors.size > 0) {
      const errorRate = ((this.rowErrors.size / this.totalRows) * 100).toFixed(
        1
      );
      return `Import validation failed: ${totalErrors} error(s) found in ${this.rowErrors.size} row(s) (${errorRate}% error rate)`;
    }

    return 'Import validation failed';
  }

  clear(): void {
    this.rowErrors.clear();
    this.fileErrors = [];
    this.headerErrors = [];
    this.totalRows = 0;
    this.validRows = 0;
  }
}
