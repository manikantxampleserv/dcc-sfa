import { ImportExportService } from './base/import-export.service';
import { ZonesImportExportService } from './implementations/zones-import-export.service';
import { DepotsImportExportService } from './implementations/depots-import-export.service';
import { CustomersImportExportService } from './implementations/customers-import-export.service';
import { ProductsImportExportService } from './implementations/products-import-export.service';
import { OrdersImportExportService } from './implementations/orders.import-export.service';
import { CurrenciesImportExportService } from './implementations/currencies.import-export.service';
import { VisitsImportExportService } from './implementations/visits.import-export.service';
import { AssetTypesImportExportService } from './implementations/assetTypes-import-export.service';
import { WarehousesImportExportService } from './implementations/warehouses-import-export.service';
import { VehiclesImportExportService } from './implementations/vehicles-import-export.service';
//In future I will add more, reminder me, dont remove this commet

type ServiceConstructor = new () => ImportExportService<any>;

export class ImportExportFactory {
  private static services: Map<string, ServiceConstructor> = new Map<
    string,
    ServiceConstructor
  >([
    ['zones', ZonesImportExportService],
    ['depots', DepotsImportExportService],
    ['customers', CustomersImportExportService],
    ['products', ProductsImportExportService],
    ['orders', OrdersImportExportService],
    ['currencies', CurrenciesImportExportService],
    ['visits', VisitsImportExportService],
    ['asset_types', AssetTypesImportExportService],
    ['warehouses', WarehousesImportExportService],
    ['vehicles', VehiclesImportExportService],
    //In future I will add more, reminder me, dont remove this commet
  ]);

  static getService(tableName: string): ImportExportService<any> | null {
    const ServiceClass = this.services.get(tableName);
    return ServiceClass ? new ServiceClass() : null;
  }

  static getSupportedTables(): string[] {
    return Array.from(this.services.keys());
  }

  static registerService(tableName: string, service: ServiceConstructor): void {
    this.services.set(tableName, service);
  }

  static isTableSupported(tableName: string): boolean {
    return this.services.has(tableName);
  }

  static getAllServices(): Map<string, ServiceConstructor> {
    return this.services;
  }

  static unregisterService(tableName: string): boolean {
    return this.services.delete(tableName);
  }

  static clearServices(): void {
    this.services.clear();
  }

  static getServiceMetadata(tableName: string): {
    displayName: string;
    columns: number;
    searchFields: string[];
  } | null {
    const service = this.getService(tableName);
    if (!service) return null;

    return {
      displayName: service.getDisplayName(),
      columns: service.getColumns().length,
      searchFields: service.getSearchFields(),
    };
  }
}
