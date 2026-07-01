import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition, ImportOptions, ImportResult } from '../../../types/import-export.types';
export declare class AssetBrandsImportExportService extends ImportExportService<any> {
    protected modelName: "asset_brands";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    private codeCounters;
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(key: string): string;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected validateForeignKeys(_data: any, _tx?: any): Promise<string | null>;
    private generateCode;
    private initializeCodeCounters;
    protected prepareDataForImport(data: any, userId: number, tx?: any): Promise<any>;
    importData(data: any[], userId: number, options?: ImportOptions): Promise<ImportResult>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
}
//# sourceMappingURL=assetBrands-import-export.service.d.ts.map