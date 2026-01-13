"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportExportFactory = void 0;
const zones_import_export_service_1 = require("./implementations/zones-import-export.service");
const depots_import_export_service_1 = require("./implementations/depots-import-export.service");
const customers_import_export_service_1 = require("./implementations/customers-import-export.service");
const products_import_export_service_1 = require("./implementations/products-import-export.service");
const orders_import_export_service_1 = require("./implementations/orders-import-export.service");
const currencies_import_export_service_1 = require("./implementations/currencies.import-export.service");
const visits_import_export_service_1 = require("./implementations/visits.import-export.service");
const assetTypes_import_export_service_1 = require("./implementations/assetTypes-import-export.service");
const assetMaster_import_export_service_1 = require("./implementations/assetMaster-import-export.service");
const warehouses_import_export_service_1 = require("./implementations/warehouses-import-export.service");
const vehicles_import_export_service_1 = require("./implementations/vehicles-import-export.service");
const surveys_import_export_service_1 = require("./implementations/surveys-import-export.service");
const kpiTargets_import_export_service_1 = require("./implementations/kpiTargets-import-export.service");
const priceLists_import_export_service_1 = require("./implementations/priceLists-import-export.service");
const loginHistory_import_export_service_1 = require("./implementations/loginHistory-import-export.service");
const salesTargetGroups_import_export_service_1 = require("./implementations/salesTargetGroups-import-export.service");
const salesTargets_import_export_service_1 = require("./implementations/salesTargets-import-export.service");
const salesBonusRules_import_export_service_1 = require("./implementations/salesBonusRules-import-export.service");
const productCategories_import_export_service_1 = require("./implementations/productCategories-import-export.service");
const productSubCategories_import_export_service_1 = require("./implementations/productSubCategories-import-export.service");
const brands_import_export_service_1 = require("./implementations/brands-import-export.service");
const unitOfMeasurement_import_export_service_1 = require("./implementations/unitOfMeasurement-import-export.service");
const deliverySchedules_import_export_service_1 = require("./implementations/deliverySchedules-import-export.service");
const returnRequests_import_export_service_1 = require("./implementations/returnRequests-import-export.service");
const payments_import_export_service_1 = require("./implementations/payments-import-export.service");
const invoices_import_export_service_1 = require("./implementations/invoices-import-export.service");
const creditNotes_import_export_service_1 = require("./implementations/creditNotes-import-export.service");
const assetMovements_import_export_service_1 = require("./implementations/assetMovements-import-export.service");
const assetMaintenance_import_export_service_1 = require("./implementations/assetMaintenance-import-export.service");
const competitorActivity_import_export_service_1 = require("./implementations/competitorActivity-import-export.service");
const coolerInstallations_import_export_service_1 = require("./implementations/coolerInstallations-import-export.service");
const coolerInspections_import_export_service_1 = require("./implementations/coolerInspections-import-export.service");
const stockTransferRequests_import_export_service_1 = require("./implementations/stockTransferRequests-import-export.service");
const stockMovements_import_export_service_1 = require("./implementations/stockMovements-import-export.service");
const vanInventory_import_export_service_1 = require("./implementations/vanInventory-import-export.service");
const sales_target_overrides_import_export_service_1 = require("./implementations/sales-target-overrides.import-export.service");
const customer_assets_import_export_service_1 = require("./implementations/customer-assets.import-export.service");
const visit_tasks_import_export_service_1 = require("./implementations/visit-tasks.import-export.service");
const promotions_import_export_service_1 = require("./implementations/promotions.import-export.service");
const promotion_products_import_export_service_1 = require("./implementations/promotion-products.import-export.service");
const routeTypes_import_export_service_1 = require("./implementations/routeTypes-import-export.service");
const customerComplaints_import_export_service_1 = require("./implementations/customerComplaints-import-export.service");
const productFlavours_import_export_service_1 = require("./implementations/productFlavours-import-export.service");
const productVolumes_import_export_service_1 = require("./implementations/productVolumes-import-export.service");
const productShelfLife_import_export_service_1 = require("./implementations/productShelfLife-import-export.service");
const productTypes_import_export_service_1 = require("./implementations/productTypes-import-export.service");
const productTargetGroups_import_export_service_1 = require("./implementations/productTargetGroups-import-export.service");
const productWebOrders_import_export_service_1 = require("./implementations/productWebOrders-import-export.service");
const coolerTypes_import_export_service_1 = require("./implementations/coolerTypes-import-export.service");
const coolerSubTypes_import_export_service_1 = require("./implementations/coolerSubTypes-import-export.service");
const taxMaster_import_export_service_1 = require("./implementations/taxMaster-import-export.service");
const batchLots_import_export_service_1 = require("./implementations/batchLots-import-export.service");
const UserImportExportService_1 = require("./implementations/UserImportExportService");
const role_import_export_service_1 = require("./implementations/role.import-export.service");
const route_import_export_service_1 = require("./implementations/route-import-export.service");
class ImportExportFactory {
    static services = new Map([
        ['zones', zones_import_export_service_1.ZonesImportExportService],
        ['depots', depots_import_export_service_1.DepotsImportExportService],
        ['customers', customers_import_export_service_1.CustomersImportExportService],
        ['products', products_import_export_service_1.ProductsImportExportService],
        ['orders', orders_import_export_service_1.OrdersImportExportService],
        ['currencies', currencies_import_export_service_1.CurrenciesImportExportService],
        ['visits', visits_import_export_service_1.VisitsImportExportService],
        ['asset_types', assetTypes_import_export_service_1.AssetTypesImportExportService],
        ['asset_master', assetMaster_import_export_service_1.AssetMasterImportExportService],
        ['warehouses', warehouses_import_export_service_1.WarehousesImportExportService],
        ['vehicles', vehicles_import_export_service_1.VehiclesImportExportService],
        ['surveys', surveys_import_export_service_1.SurveysImportExportService],
        ['employee_kpi_targets', kpiTargets_import_export_service_1.KpiTargetsImportExportService],
        ['pricelists', priceLists_import_export_service_1.PriceListsImportExportService],
        ['login_history', loginHistory_import_export_service_1.LoginHistoryImportExportService],
        ['sales_target_groups', salesTargetGroups_import_export_service_1.SalesTargetGroupsImportExportService],
        ['sales_targets', salesTargets_import_export_service_1.SalesTargetsImportExportService],
        ['sales_bonus_rules', salesBonusRules_import_export_service_1.SalesBonusRulesImportExportService],
        ['product_categories', productCategories_import_export_service_1.ProductCategoriesImportExportService],
        ['product_sub_categories', productSubCategories_import_export_service_1.ProductSubCategoriesImportExportService],
        ['brands', brands_import_export_service_1.BrandsImportExportService],
        ['unit_of_measurement', unitOfMeasurement_import_export_service_1.UnitOfMeasurementImportExportService],
        ['delivery_schedules', deliverySchedules_import_export_service_1.DeliverySchedulesImportExportService],
        ['return_requests', returnRequests_import_export_service_1.ReturnRequestsImportExportService],
        ['payments', payments_import_export_service_1.PaymentsImportExportService],
        ['invoices', invoices_import_export_service_1.InvoicesImportExportService],
        ['credit_notes', creditNotes_import_export_service_1.CreditNotesImportExportService],
        ['asset_movements', assetMovements_import_export_service_1.AssetMovementsImportExportService],
        ['asset_maintenance', assetMaintenance_import_export_service_1.AssetMaintenanceImportExportService],
        ['competitor_activity', competitorActivity_import_export_service_1.CompetitorActivityImportExportService],
        ['cooler_installations', coolerInstallations_import_export_service_1.CoolerInstallationsImportExportService],
        ['cooler_inspections', coolerInspections_import_export_service_1.CoolerInspectionsImportExportService],
        ['stock_transfer_requests', stockTransferRequests_import_export_service_1.StockTransferRequestsImportExportService],
        ['stock_movements', stockMovements_import_export_service_1.StockMovementsImportExportService],
        ['van_inventory', vanInventory_import_export_service_1.VanInventoryImportExportService],
        ['products', products_import_export_service_1.ProductsImportExportService],
        ['sales_target_overrides', sales_target_overrides_import_export_service_1.SalesTargetOverridesImportExportService],
        ['customer_assets', customer_assets_import_export_service_1.CustomerAssetsImportExportService],
        ['visit_tasks', visit_tasks_import_export_service_1.VisitTasksImportExportService],
        ['promotions', promotions_import_export_service_1.PromotionsImportExportService],
        ['promotion_products', promotion_products_import_export_service_1.PromotionProductsImportExportService],
        ['route_type', routeTypes_import_export_service_1.RouteTypesImportExportService],
        ['customer_complaints', customerComplaints_import_export_service_1.CustomerComplaintsImportExportService],
        ['product_flavours', productFlavours_import_export_service_1.ProductFlavoursImportExportService],
        ['product_volumes', productVolumes_import_export_service_1.ProductVolumesImportExportService],
        ['product_shelf_life', productShelfLife_import_export_service_1.ProductShelfLifeImportExportService],
        ['product_type', productTypes_import_export_service_1.ProductTypesImportExportService],
        ['product_target_group', productTargetGroups_import_export_service_1.ProductTargetGroupsImportExportService],
        ['product_web_order', productWebOrders_import_export_service_1.ProductWebOrdersImportExportService],
        ['cooler_types', coolerTypes_import_export_service_1.CoolerTypesImportExportService],
        ['cooler_sub_types', coolerSubTypes_import_export_service_1.CoolerSubTypesImportExportService],
        ['tax_master', taxMaster_import_export_service_1.TaxMasterImportExportService],
        ['batch_lots', batchLots_import_export_service_1.BatchLotsImportExportService],
        ['users', UserImportExportService_1.UserImportExportService],
        ['roles', role_import_export_service_1.RoleImportExportService],
        ['routes', route_import_export_service_1.RouteImportExportService],
    ]);
    static getService(tableName) {
        const ServiceClass = this.services.get(tableName);
        return ServiceClass ? new ServiceClass() : null;
    }
    static getSupportedTables() {
        return Array.from(this.services.keys());
    }
    static registerService(tableName, service) {
        this.services.set(tableName, service);
    }
    static isTableSupported(tableName) {
        return this.services.has(tableName);
    }
    static getAllServices() {
        return this.services;
    }
    static unregisterService(tableName) {
        return this.services.delete(tableName);
    }
    static clearServices() {
        this.services.clear();
    }
    static getServiceMetadata(tableName) {
        const service = this.getService(tableName);
        if (!service)
            return null;
        return {
            displayName: service.getDisplayName(),
            columns: service.getColumns().length,
            searchFields: service.getSearchFields(),
        };
    }
}
exports.ImportExportFactory = ImportExportFactory;
//# sourceMappingURL=import-export-factory.service.js.map