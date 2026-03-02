import { ColumnDefinition, ImportResult, ExportOptions, ImportOptions } from '../../../types/import-export.types';
import { ParseResultWithErrors } from '../../../types/import-export-errors.types';
import { PrismaClient } from '@prisma/client';
export declare abstract class ImportExportService<T> {
    protected abstract modelName: keyof PrismaClient;
    protected abstract columns: ColumnDefinition[];
    protected abstract displayName: string;
    protected abstract uniqueFields: string[];
    protected abstract searchFields: string[];
    protected getModel(): any;
    getCount(filters?: any): Promise<number>;
    getDisplayName(): string;
    getColumns(): ColumnDefinition[];
    getSearchFields(): string[];
    parseExcelFile(buffer: Buffer): Promise<ParseResultWithErrors>;
    generateTemplate(): Promise<Buffer>;
    exportToExcel(options?: ExportOptions): Promise<Buffer>;
    exportToPDF(options?: ExportOptions): Promise<Buffer>;
    importData(data: any[], userId: number, options?: ImportOptions): Promise<ImportResult>;
    batchImport(data: any[], userId: number, batchSize?: number, options?: ImportOptions): Promise<ImportResult>;
    protected abstract getSampleData(): Promise<any[]>;
    protected abstract getColumnDescription(key: string): string;
    protected abstract transformDataForExport(data: any[]): Promise<any[]>;
    protected abstract checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected abstract validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    protected abstract prepareDataForImport(data: any, userId: number): Promise<any>;
    protected abstract updateExisting(data: any, userId: number, tx?: any): Promise<any>;
}
//# sourceMappingURL=import-export.service.d.ts.map