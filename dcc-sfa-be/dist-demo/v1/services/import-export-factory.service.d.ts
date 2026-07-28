import { ImportExportService } from './base/import-export.service';
type ServiceConstructor = new () => ImportExportService<any>;
export declare class ImportExportFactory {
    private static services;
    static getService(tableName: string): ImportExportService<any> | null;
    static getSupportedTables(): string[];
    static registerService(tableName: string, service: ServiceConstructor): void;
    static isTableSupported(tableName: string): boolean;
    static getAllServices(): Map<string, ServiceConstructor>;
    static unregisterService(tableName: string): boolean;
    static clearServices(): void;
    static getServiceMetadata(tableName: string): {
        displayName: string;
        columns: number;
        searchFields: string[];
    } | null;
}
export {};
//# sourceMappingURL=import-export-factory.service.d.ts.map