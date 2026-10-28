import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';
export declare class VanInventoryImportExportService extends ImportExportService<any> {
    protected modelName: "van_inventory";
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
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    protected prepareDataForImport(data: any, userId: number): Promise<any>;
    protected updateExisting(_data: any, _userId: number, _tx?: any): Promise<any>;
    importData(data: any[], userId: number, options?: any): Promise<any>;
    private buildExportQuery;
    exportToExcelStream(res: any, options?: any): Promise<void>;
    exportToExcel(options?: any): Promise<Buffer>;
}
export interface VanInventoryExportRow {
    date: string;
    type: string;
    vanInventoryNo: number | string;
    userName: string;
    product: string;
    trackingType: string;
    quantity: number | string;
    batchSerials: string;
}
export declare function setupVanInventoryWorksheet(worksheet: any): void;
export declare function writeVanInventoryBatchToWorksheet(worksheet: any, data: any[]): void;
export declare function generateVanInventoryExcelWorkbook(rows: VanInventoryExportRow[]): Promise<Buffer>;
//# sourceMappingURL=vanInventory-import-export.service.d.ts.map