import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class AssetMasterImportExportService extends ImportExportService<any> {
    protected modelName: "asset_master";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    protected masterTableConfigs: {
        masterTable: any;
        masterKey: string;
        masterDisplayFields: string[];
        sheetName: string;
        description: string;
    }[];
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(key: string): string;
    /**
     * Builds the export query with necessary relational includes and filters
     * @param options Export query options
     * @returns Prisma query configuration object
     */
    private buildExportQuery;
    /**
     * Helper to convert 1-based column number to Excel column letter
     * @param colNumber 1-based column number
     * @returns Excel column letter (e.g. A, B, ..., Z, AA, AB)
     */
    private getColumnLetter;
    /**
     * Streams the exported asset master data in batches to prevent MSSQL parameter limit issues
     * @param res HTTP response stream
     * @param options Export options including filters, limit, and sorting
     */
    exportToExcelStream(res: any, options?: any): Promise<void>;
    /**
     * Generates an Excel buffer of asset master data in batches to prevent MSSQL parameter limit issues
     * @param options Export options including filters, limit, and sorting
     * @returns Excel file buffer
     */
    exportToExcel(options?: any): Promise<Buffer>;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    protected prepareDataForImport(data: any, userId: number, tx?: any): Promise<any>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
}
//# sourceMappingURL=assetMaster-import-export.service.d.ts.map