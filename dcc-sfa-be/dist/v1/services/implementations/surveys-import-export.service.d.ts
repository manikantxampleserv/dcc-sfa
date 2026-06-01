import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class SurveysImportExportService extends ImportExportService<any> {
    protected modelName: "surveys";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    protected columns: ColumnDefinition[];
    getSampleData(): Promise<any[]>;
    transformDataForExport(data: any): Promise<any>;
    checkDuplicate(data: any, tx?: any): Promise<string | null>;
    getColumnDescription(key: string): string;
    validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    prepareDataForImport(data: any, userId: number, tx?: any): Promise<any>;
    updateExisting(data: any, userId: number, tx?: any): Promise<any>;
    transformDataForImport(data: any, userId: number): Promise<any>;
}
//# sourceMappingURL=surveys-import-export.service.d.ts.map