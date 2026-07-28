import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class LoginHistoryImportExportService extends ImportExportService<any> {
    protected modelName: "login_history";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(): string;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any): Promise<string | null>;
    protected transformDataForImport(data: any[]): Promise<any[]>;
    protected validateForeignKeys(data: any[]): Promise<string | null>;
    protected prepareDataForImport(data: any[]): Promise<any[]>;
    protected updateExisting(id: number, data: any): Promise<any>;
}
//# sourceMappingURL=loginHistory-import-export.service.d.ts.map