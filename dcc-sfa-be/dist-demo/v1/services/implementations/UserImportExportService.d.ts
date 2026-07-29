import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class UserImportExportService extends ImportExportService<any> {
    protected modelName: "users";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    private validationCache;
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
    protected prepareDataForImport(data: any, userId: number, tx?: any): Promise<any>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
    exportToExcel(options?: any): Promise<Buffer>;
}
//# sourceMappingURL=UserImportExportService.d.ts.map