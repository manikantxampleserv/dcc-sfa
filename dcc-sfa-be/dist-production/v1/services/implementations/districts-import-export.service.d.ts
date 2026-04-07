import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';
export declare class DistrictsImportExportService extends ImportExportService<any> {
    protected modelName: "districts";
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
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
}
//# sourceMappingURL=districts-import-export.service.d.ts.map