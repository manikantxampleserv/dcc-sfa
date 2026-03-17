import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class StockTransferRequestsImportExportService extends ImportExportService<any> {
    protected modelName: "stock_transfer_requests";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(key: string): string;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    protected prepareDataForImport(data: any, userId: number): Promise<any>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
    /**
     * Get available IDs for reference during import.
     */
    getAvailableIds(): Promise<{
        users: Array<{
            id: number;
            name: string;
        }>;
        warehouses: Array<{
            id: number;
            name: string;
        }>;
    }>;
    exportToExcel(options?: any): Promise<Buffer>;
}
//# sourceMappingURL=stockTransferRequests-import-export.service.d.ts.map