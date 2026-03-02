import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class CustomersImportExportService extends ImportExportService<any> {
    protected modelName: "customers";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    private generateCustomerCode;
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(key: string): string;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    protected prepareDataForImport(data: any, userId: number): Promise<any>;
    importData(data: any[], userId: number, options?: any): Promise<any>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
    exportToExcel(options?: any): Promise<Buffer>;
}
//# sourceMappingURL=customers-import-export.service.d.ts.map