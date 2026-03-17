import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition, ImportOptions, ImportResult } from '../../../types/import-export.types';
export declare class AssetSubTypesImportExportService extends ImportExportService<any> {
    protected modelName: "asset_sub_types";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    private codeCounters;
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(key: string): string;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    private generateCode;
    /**
     * Initialize counters with existing codes to avoid conflicts
     * This should be called once at the beginning of the import process
     */
    private initializeCodeCounters;
    protected prepareDataForImport(data: any, userId: number): Promise<any>;
    /**
     * Override importData to initialize code counters before transaction starts
     */
    importData(data: any[], userId: number, options?: ImportOptions): Promise<ImportResult>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
}
//# sourceMappingURL=assetSubTypes-import-export.service.d.ts.map