/**
 * @fileoverview Promotional Materials Import/Export Service
 * @description Handles bulk Excel importing and exporting for promotional materials catalog
 * @version 1.0.0
 */
import { ColumnDefinition } from '../../../types/import-export.types';
import { ImportExportService } from '../base/import-export.service';
export declare class PromotionalMaterialsImportExportService extends ImportExportService<any> {
    protected modelName: "promotional_materials";
    protected displayName: string;
    protected uniqueFields: string[];
    protected searchFields: string[];
    private lastNumberCache;
    private generateMaterialCode;
    protected columns: ColumnDefinition[];
    protected getSampleData(): Promise<any[]>;
    protected getColumnDescription(key: string): string;
    protected transformDataForExport(data: any[]): Promise<any[]>;
    protected checkDuplicate(data: any, tx?: any): Promise<string | null>;
    protected validateForeignKeys(_data: any, _tx?: any): Promise<string | null>;
    protected prepareDataForImport(data: any, userId: number, tx?: any): Promise<any>;
    protected updateExisting(data: any, userId: number, tx?: any): Promise<any>;
}
//# sourceMappingURL=promotionalMaterials-import-export.service.d.ts.map