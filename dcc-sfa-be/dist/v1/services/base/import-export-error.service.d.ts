import { FieldError, UniversalErrorResponse } from '../../../types/import-export-errors.types';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class ImportExportErrorHandler {
    private columns;
    private rowErrors;
    private fileErrors;
    private headerErrors;
    private totalRows;
    private validRows;
    constructor(columns: ColumnDefinition[]);
    addFieldError(row: number, field: string, message: string, type?: FieldError['type'], value?: any): void;
    addFileError(message: string, details?: any): void;
    addHeaderError(message: string, details?: any): void;
    checkMissingFields(row: any, rowNum: number): void;
    validateField(value: any, column: ColumnDefinition, rowNum: number): boolean;
    transformField(value: any, column: ColumnDefinition, rowNum: number): any;
    setTotalRows(count: number): void;
    setValidRows(count: number): void;
    hasErrors(): boolean;
    private generateFieldSummary;
    buildErrorResponse(customMessage?: string): UniversalErrorResponse;
    private generateErrorMessage;
    clear(): void;
}
//# sourceMappingURL=import-export-error.service.d.ts.map