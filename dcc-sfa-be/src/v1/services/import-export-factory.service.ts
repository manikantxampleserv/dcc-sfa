import { ImportExportService } from './base/import-export.service';
import { ZonesImportExportService } from './implementations/zones-import-export.service';

export class ImportExportFactory {
  private static services: Map<string, new () => ImportExportService<any>> =
    new Map([
      ['zones', ZonesImportExportService],
      //In future I will add for reminder me
    ]);

  static getService(tableName: string): ImportExportService<any> | null {
    const ServiceClass = this.services.get(tableName);
    return ServiceClass ? new ServiceClass() : null;
  }

  static getSupportedTables(): string[] {
    return Array.from(this.services.keys());
  }

  static registerService(
    tableName: string,
    service: new () => ImportExportService<any>
  ): void {
    this.services.set(tableName, service);
  }

  static isTableSupported(tableName: string): boolean {
    return this.services.has(tableName);
  }
}
