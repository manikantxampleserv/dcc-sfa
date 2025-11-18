import { ImportExportService } from './base/import-export.service';
import { ZonesImportExportService } from './implementations/zones-import-export.service';
import { DepotsImportExportService } from './implementations/depots-import-export.service';
import { CustomersImportExportService } from './implementations/customers-import-export.service';
import { ProductsImportExportService } from './implementations/products-import-export.service';
import { OrdersImportExportService } from './implementations/orders-import-export.service';
import { CurrenciesImportExportService } from './implementations/currencies.import-export.service';
import { VisitsImportExportService } from './implementations/visits.import-export.service';
import { AssetTypesImportExportService } from './implementations/assetTypes-import-export.service';
import { AssetMasterImportExportService } from './implementations/assetMaster-import-export.service';
import { WarehousesImportExportService } from './implementations/warehouses-import-export.service';
import { VehiclesImportExportService } from './implementations/vehicles-import-export.service';
import { SurveysImportExportService } from './implementations/surveys-import-export.service';
import { KpiTargetsImportExportService } from './implementations/kpiTargets-import-export.service';
import { PriceListsImportExportService } from './implementations/priceLists-import-export.service';
import { LoginHistoryImportExportService } from './implementations/loginHistory-import-export.service';
import { SalesTargetGroupsImportExportService } from './implementations/salesTargetGroups-import-export.service';
import { SalesTargetsImportExportService } from './implementations/salesTargets-import-export.service';
import { SalesBonusRulesImportExportService } from './implementations/salesBonusRules-import-export.service';
import { ProductCategoriesImportExportService } from './implementations/productCategories-import-export.service';
import { ProductSubCategoriesImportExportService } from './implementations/productSubCategories-import-export.service';
import { BrandsImportExportService } from './implementations/brands-import-export.service';
import { UnitOfMeasurementImportExportService } from './implementations/unitOfMeasurement-import-export.service';
import { DeliverySchedulesImportExportService } from './implementations/deliverySchedules-import-export.service';
import { ReturnRequestsImportExportService } from './implementations/returnRequests-import-export.service';
import { PaymentsImportExportService } from './implementations/payments-import-export.service';
import { InvoicesImportExportService } from './implementations/invoices-import-export.service';
import { CreditNotesImportExportService } from './implementations/creditNotes-import-export.service';
import { AssetMovementsImportExportService } from './implementations/assetMovements-import-export.service';
import { AssetMaintenanceImportExportService } from './implementations/assetMaintenance-import-export.service';
import { CompetitorActivityImportExportService } from './implementations/competitorActivity-import-export.service';
import { CoolerInstallationsImportExportService } from './implementations/coolerInstallations-import-export.service';
import { CoolerInspectionsImportExportService } from './implementations/coolerInspections-import-export.service';
import { StockTransferRequestsImportExportService } from './implementations/stockTransferRequests-import-export.service';
import { StockMovementsImportExportService } from './implementations/stockMovements-import-export.service';
import { VanInventoryImportExportService } from './implementations/vanInventory-import-export.service';
import { SalesTargetOverridesImportExportService } from './implementations/sales-target-overrides.import-export.service';
import { CustomerAssetsImportExportService } from './implementations/customer-assets.import-export.service';
import { VisitTasksImportExportService } from './implementations/visit-tasks.import-export.service';
import { PromotionsImportExportService } from './implementations/promotions.import-export.service';
import { PromotionProductsImportExportService } from './implementations/promotion-products.import-export.service';
import { RouteTypesImportExportService } from './implementations/routeTypes-import-export.service';
import { CustomerComplaintsImportExportService } from './implementations/customerComplaints-import-export.service';
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
    ['asset_master', AssetMasterImportExportService],
    ['warehouses', WarehousesImportExportService],
    ['vehicles', VehiclesImportExportService],
    ['surveys', SurveysImportExportService],
    ['employee_kpi_targets', KpiTargetsImportExportService],
    ['pricelists', PriceListsImportExportService],
    ['login_history', LoginHistoryImportExportService],
    ['sales_target_groups', SalesTargetGroupsImportExportService],
    ['sales_targets', SalesTargetsImportExportService],
    ['sales_bonus_rules', SalesBonusRulesImportExportService],
    ['product_categories', ProductCategoriesImportExportService],
    ['product_sub_categories', ProductSubCategoriesImportExportService],
    ['brands', BrandsImportExportService],
    ['unit_of_measurement', UnitOfMeasurementImportExportService],
    ['delivery_schedules', DeliverySchedulesImportExportService],
    ['return_requests', ReturnRequestsImportExportService],
    ['payments', PaymentsImportExportService],
    ['invoices', InvoicesImportExportService],
    ['credit_notes', CreditNotesImportExportService],
    ['asset_movements', AssetMovementsImportExportService],
    ['asset_maintenance', AssetMaintenanceImportExportService],
    ['competitor_activity', CompetitorActivityImportExportService],
    ['cooler_installations', CoolerInstallationsImportExportService],
    ['cooler_inspections', CoolerInspectionsImportExportService],
    ['stock_transfer_requests', StockTransferRequestsImportExportService],
    ['stock_movements', StockMovementsImportExportService],
    ['van_inventory', VanInventoryImportExportService],
    ['products', ProductsImportExportService],
    ['sales_target_overrides', SalesTargetOverridesImportExportService],
    ['customer_assets', CustomerAssetsImportExportService],
    ['visit_tasks', VisitTasksImportExportService],
    ['promotions', PromotionsImportExportService],
    ['promotion_products', PromotionProductsImportExportService],
    ['route_type', RouteTypesImportExportService],
    ['customer_complaints', CustomerComplaintsImportExportService],
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
