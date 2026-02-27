import { ImportExportService } from '../base/import-export.service';
import { ColumnDefinition } from '../../../types/import-export.types';
export declare class AssetMasterImportExportService extends ImportExportService<any> {
    protected modelName: "asset_master";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(key: string): string;
    exportToExcel(options?: any): Promise<Buffer>;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected validateForeignKeys(data: any, tx?: any): Promise<string | null>;
    private generateAssetCode;
    protected prepareDataForImport(data: any, userId: number): Promise<any>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
}
//# sourceMappingURL=assetMaster-import-export.service.d.ts.map