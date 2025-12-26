import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class StockMovementsImportExportService extends ImportExportService<any> {
    protected modelName: "stock_movements";
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
        products: Array<{
            id: number;
            name: string;
            code: string;
        }>;
        warehouses: Array<{
            id: number;
            name: string;
        }>;
        batches: Array<{
            id: number;
            batch_number: string;
            product_id: number;
        }>;
        serials: Array<{
            id: number;
            serial_number: string;
            product_id: number;
        }>;
    }>;
    exportToExcel(options?: any): Promise<Buffer>;
}
//# sourceMappingURL=stockMovements-import-export.service.d.ts.map