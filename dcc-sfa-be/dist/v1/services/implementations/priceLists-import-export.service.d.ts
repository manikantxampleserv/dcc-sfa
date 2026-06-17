import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class PriceListsImportExportService extends ImportExportService<any> {
    protected modelName: "pricelists";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(key: string): string;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected transformDataForImport(data: any, userId: number): Promise<any>;
    protected validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    protected prepareDataForImport(data: any, userId: number): Promise<any>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
}
//# sourceMappingURL=priceLists-import-export.service.d.ts.map