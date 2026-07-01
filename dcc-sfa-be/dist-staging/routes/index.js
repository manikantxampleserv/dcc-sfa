"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerCategoryGrading_routes_1 = __importDefault(require("../v1/controllers/customerCategoryGrading.routes"));
const ai_routes_1 = __importDefault(require("../v1/routes/ai.routes"));
const alerts_routes_1 = __importDefault(require("../v1/routes/alerts.routes"));
const apiTokens_routes_1 = __importDefault(require("../v1/routes/apiTokens.routes"));
const approvalWorkflows_routes_1 = __importDefault(require("../v1/routes/approvalWorkflows.routes"));
const approvalWorkflowSetup_routes_1 = __importDefault(require("../v1/routes/approvalWorkflowSetup.routes"));
const assetImages_routes_1 = __importDefault(require("../v1/routes/assetImages.routes"));
const assetMaintenance_routes_1 = __importDefault(require("../v1/routes/assetMaintenance.routes"));
const assetMaster_routes_1 = __importDefault(require("../v1/routes/assetMaster.routes"));
const assetMaterBrands_routes_1 = __importDefault(require("../v1/routes/assetMaterBrands.routes"));
const assetMovements_routes_1 = __importDefault(require("../v1/routes/assetMovements.routes"));
const assetSubTypes_routes_1 = __importDefault(require("../v1/routes/assetSubTypes.routes"));
const assetTypes_routes_1 = __importDefault(require("../v1/routes/assetTypes.routes"));
const assetWarrantyClaims_routes_1 = __importDefault(require("../v1/routes/assetWarrantyClaims.routes"));
const attendance_routes_1 = __importDefault(require("../v1/routes/attendance.routes"));
const auditLogs_routes_1 = __importDefault(require("../v1/routes/auditLogs.routes"));
const errorLogs_routes_1 = __importDefault(require("../v1/routes/errorLogs.routes"));
const auth_routes_1 = __importDefault(require("../v1/routes/auth.routes"));
const barcode_routes_1 = __importDefault(require("../v1/routes/barcode.routes"));
const batchLots_routes_1 = __importDefault(require("../v1/routes/batchLots.routes"));
const brands_routes_1 = __importDefault(require("../v1/routes/brands.routes"));
const cities_routes_1 = __importDefault(require("../v1/routes/cities.routes"));
const columnPreference_routes_1 = __importDefault(require("../v1/routes/columnPreference.routes"));
const company_routes_1 = __importDefault(require("../v1/routes/company.routes"));
const competitorActivity_routes_1 = __importDefault(require("../v1/routes/competitorActivity.routes"));
const coolerInspections_routes_1 = __importDefault(require("../v1/routes/coolerInspections.routes"));
const coolerInstallations_routes_1 = __importDefault(require("../v1/routes/coolerInstallations.routes"));
const coolerSubTypes_routes_1 = __importDefault(require("../v1/routes/coolerSubTypes.routes"));
const coolerTypes_routes_1 = __importDefault(require("../v1/routes/coolerTypes.routes"));
const creditNotes_routes_1 = __importDefault(require("../v1/routes/creditNotes.routes"));
const creditNotesItems_routes_1 = __importDefault(require("../v1/routes/creditNotesItems.routes"));
const currencies_routes_1 = __importDefault(require("../v1/routes/currencies.routes"));
const customerAssets_routes_1 = __importDefault(require("../v1/routes/customerAssets.routes"));
const customerCategory_routes_1 = __importDefault(require("../v1/routes/customerCategory.routes"));
const customerChannels_routes_1 = __importDefault(require("../v1/routes/customerChannels.routes"));
const customerComplaints_routes_1 = __importDefault(require("../v1/routes/customerComplaints.routes"));
const customerDocuments_routes_1 = __importDefault(require("../v1/routes/customerDocuments.routes"));
const customerGroupMembers_routes_1 = __importDefault(require("../v1/routes/customerGroupMembers.routes"));
const customerGroups_routes_1 = __importDefault(require("../v1/routes/customerGroups.routes"));
const customers_routes_1 = __importDefault(require("../v1/routes/customers.routes"));
const customerTypes_routes_1 = __importDefault(require("../v1/routes/customerTypes.routes"));
const deliverySchedules_routes_1 = __importDefault(require("../v1/routes/deliverySchedules.routes"));
const depots_routes_1 = __importDefault(require("../v1/routes/depots.routes"));
const districts_routes_1 = __importDefault(require("../v1/routes/districts.routes"));
const executiveDashboard_routes_1 = __importDefault(require("../v1/routes/executiveDashboard.routes"));
const gpsTracking_routes_1 = __importDefault(require("../v1/routes/gpsTracking.routes"));
const import_export_routes_1 = __importDefault(require("../v1/routes/import-export.routes"));
const inventoryItem_routes_1 = __importDefault(require("../v1/routes/inventoryItem.routes"));
const inventoryStock_routes_1 = __importDefault(require("../v1/routes/inventoryStock.routes"));
const invoices_routes_1 = __importDefault(require("../v1/routes/invoices.routes"));
const kpiTargets_routes_1 = __importDefault(require("../v1/routes/kpiTargets.routes"));
const loginHistory_routes_1 = __importDefault(require("../v1/routes/loginHistory.routes"));
const notifications_routes_1 = __importDefault(require("../v1/routes/notifications.routes"));
const orderItems_routes_1 = __importDefault(require("../v1/routes/orderItems.routes"));
const orders_routes_1 = __importDefault(require("../v1/routes/orders.routes"));
const orgChart_routes_1 = __importDefault(require("../v1/routes/orgChart.routes"));
const payments_routes_1 = __importDefault(require("../v1/routes/payments.routes"));
const permissions_routes_1 = __importDefault(require("../v1/routes/permissions.routes"));
const priceLists_routes_1 = __importDefault(require("../v1/routes/priceLists.routes"));
const priceListsItems_routes_1 = __importDefault(require("../v1/routes/priceListsItems.routes"));
const productCategories_routes_1 = __importDefault(require("../v1/routes/productCategories.routes"));
const productFlavours_routes_1 = __importDefault(require("../v1/routes/productFlavours.routes"));
const products_routes_1 = __importDefault(require("../v1/routes/products.routes"));
const productShelfLife_routes_1 = __importDefault(require("../v1/routes/productShelfLife.routes"));
const productSubCategories_routes_1 = __importDefault(require("../v1/routes/productSubCategories.routes"));
const productTargetGroups_routes_1 = __importDefault(require("../v1/routes/productTargetGroups.routes"));
const productTypes_routes_1 = __importDefault(require("../v1/routes/productTypes.routes"));
const productVolumes_routes_1 = __importDefault(require("../v1/routes/productVolumes.routes"));
const productWebOrders_routes_1 = __importDefault(require("../v1/routes/productWebOrders.routes"));
const promotionParameters_routes_1 = __importDefault(require("../v1/routes/promotionParameters.routes"));
const promotionProducts_routes_1 = __importDefault(require("../v1/routes/promotionProducts.routes"));
const promotions_routes_1 = __importDefault(require("../v1/routes/promotions.routes"));
const regions_routes_1 = __importDefault(require("../v1/routes/regions.routes"));
const reports_routes_1 = __importDefault(require("../v1/routes/reports.routes"));
const requests_routes_1 = __importDefault(require("../v1/routes/requests.routes"));
const returnRequests_routes_1 = __importDefault(require("../v1/routes/returnRequests.routes"));
const rolePermissions_routes_1 = __importDefault(require("../v1/routes/rolePermissions.routes"));
const roles_routes_1 = __importDefault(require("../v1/routes/roles.routes"));
const route_routes_1 = __importDefault(require("../v1/routes/route.routes"));
const routePriceLists_routes_1 = __importDefault(require("../v1/routes/routePriceLists.routes"));
const routeTypes_routes_1 = __importDefault(require("../v1/routes/routeTypes.routes"));
const salesBonusRule_routes_1 = __importDefault(require("../v1/routes/salesBonusRule.routes"));
const salesTargetGroups_routes_1 = __importDefault(require("../v1/routes/salesTargetGroups.routes"));
const salesTargetOverrides_routes_1 = __importDefault(require("../v1/routes/salesTargetOverrides.routes"));
const salesTargets_routes_1 = __importDefault(require("../v1/routes/salesTargets.routes"));
const sap_routes_1 = __importDefault(require("../v1/routes/sap.routes"));
const settings_routes_1 = __importDefault(require("../v1/routes/settings.routes"));
const stockMovements_routes_1 = __importDefault(require("../v1/routes/stockMovements.routes"));
const stockTransferLines_routes_1 = __importDefault(require("../v1/routes/stockTransferLines.routes"));
const stockTransferRequests_routes_1 = __importDefault(require("../v1/routes/stockTransferRequests.routes"));
const subunits_routes_1 = __importDefault(require("../v1/routes/subunits.routes"));
const surveyResponses_routes_1 = __importDefault(require("../v1/routes/surveyResponses.routes"));
const surveys_routes_1 = __importDefault(require("../v1/routes/surveys.routes"));
const taxMaster_routes_1 = __importDefault(require("../v1/routes/taxMaster.routes"));
const templates_routes_1 = __importDefault(require("../v1/routes/templates.routes"));
const unitOfMeasurement_routes_1 = __importDefault(require("../v1/routes/unitOfMeasurement.routes"));
const user_routes_1 = __importDefault(require("../v1/routes/user.routes"));
const vanInventory_routes_1 = __importDefault(require("../v1/routes/vanInventory.routes"));
const reconciliation_routes_1 = __importDefault(require("../v1/routes/reconciliation.routes"));
const vehicles_routes_1 = __importDefault(require("../v1/routes/vehicles.routes"));
const visits_routes_1 = __importDefault(require("../v1/routes/visits.routes"));
const visitTasks_routes_1 = __importDefault(require("../v1/routes/visitTasks.routes"));
const warehouses_routes_1 = __importDefault(require("../v1/routes/warehouses.routes"));
const workflow_routes_1 = __importDefault(require("../v1/routes/workflow.routes"));
const zones_routes_1 = __importDefault(require("../v1/routes/zones.routes"));
const routes = (0, express_1.Router)();
routes.use('/v1/org-chart', orgChart_routes_1.default);
routes.use('/v1', barcode_routes_1.default);
routes.use('/v1', ai_routes_1.default);
routes.use('/v1', auth_routes_1.default);
routes.use('/v1', user_routes_1.default);
routes.use('/v1', roles_routes_1.default);
routes.use('/v1', rolePermissions_routes_1.default);
routes.use('/v1', permissions_routes_1.default);
routes.use('/v1', company_routes_1.default);
routes.use('/v1', depots_routes_1.default);
routes.use('/v1', errorLogs_routes_1.default);
routes.use('/v1', zones_routes_1.default);
routes.use('/v1', import_export_routes_1.default);
routes.use('/v1', route_routes_1.default);
routes.use('/v1', visits_routes_1.default);
routes.use('/v1', customers_routes_1.default);
routes.use('/v1', orders_routes_1.default);
routes.use('/v1', currencies_routes_1.default);
routes.use('/v1', inventoryStock_routes_1.default);
routes.use('/v1', products_routes_1.default);
routes.use('/v1', customerGroups_routes_1.default);
routes.use('/v1', assetTypes_routes_1.default);
routes.use('/v1', assetMaster_routes_1.default);
routes.use('/v1', warehouses_routes_1.default);
routes.use('/v1', vehicles_routes_1.default);
routes.use('/v1', customerGroupMembers_routes_1.default);
routes.use('/v1', customerDocuments_routes_1.default);
routes.use('/v1', surveys_routes_1.default);
routes.use('/v1', assetImages_routes_1.default);
routes.use('/v1', kpiTargets_routes_1.default);
routes.use('/v1', priceLists_routes_1.default);
routes.use('/v1', priceListsItems_routes_1.default);
routes.use('/v1', routePriceLists_routes_1.default);
routes.use('/v1', loginHistory_routes_1.default);
routes.use('/v1', apiTokens_routes_1.default);
routes.use('/v1', orderItems_routes_1.default);
routes.use('/v1', salesTargetGroups_routes_1.default);
routes.use('/v1', salesTargets_routes_1.default);
routes.use('/v1', salesBonusRule_routes_1.default);
routes.use('/v1', productCategories_routes_1.default);
routes.use('/v1', productSubCategories_routes_1.default);
routes.use('/v1', brands_routes_1.default);
routes.use('/v1', unitOfMeasurement_routes_1.default);
routes.use('/v1', deliverySchedules_routes_1.default);
routes.use('/v1', returnRequests_routes_1.default);
routes.use('/v1', payments_routes_1.default);
routes.use('/v1', invoices_routes_1.default);
routes.use('/v1/workflow', workflow_routes_1.default);
routes.use('/v1', creditNotes_routes_1.default);
routes.use('/v1', creditNotesItems_routes_1.default);
routes.use('/v1', assetMovements_routes_1.default);
routes.use('/v1', assetMaintenance_routes_1.default);
routes.use('/v1', competitorActivity_routes_1.default);
routes.use('/v1', coolerInstallations_routes_1.default);
routes.use('/v1', coolerInspections_routes_1.default);
routes.use('/v1', assetWarrantyClaims_routes_1.default);
routes.use('/v1', vanInventory_routes_1.default);
routes.use('/v1', reconciliation_routes_1.default);
routes.use('/v1', stockTransferRequests_routes_1.default);
routes.use('/v1', stockTransferLines_routes_1.default);
routes.use('/v1', stockMovements_routes_1.default);
routes.use('/v1', salesTargetOverrides_routes_1.default);
routes.use('/v1', customerAssets_routes_1.default);
routes.use('/v1', visitTasks_routes_1.default);
routes.use('/v1', promotions_routes_1.default);
routes.use('/v1', promotionProducts_routes_1.default);
routes.use('/v1', promotionParameters_routes_1.default);
routes.use('/v1/reports', reports_routes_1.default);
routes.use('/v1/tracking', gpsTracking_routes_1.default);
routes.use('/v1', auditLogs_routes_1.default);
routes.use('/v1', executiveDashboard_routes_1.default);
routes.use('/v1/approval-workflows', approvalWorkflows_routes_1.default);
routes.use('/v1/notifications', notifications_routes_1.default);
routes.use('/v1', routeTypes_routes_1.default);
routes.use('/v1', attendance_routes_1.default);
routes.use('/v1', requests_routes_1.default);
routes.use('/v1', approvalWorkflowSetup_routes_1.default);
routes.use('/v1', surveyResponses_routes_1.default);
routes.use('/v1', customerComplaints_routes_1.default);
routes.use('/v1', settings_routes_1.default);
routes.use('/v1', customerCategory_routes_1.default);
routes.use('/v1', customerTypes_routes_1.default);
routes.use('/v1', customerChannels_routes_1.default);
routes.use('/v1', productFlavours_routes_1.default);
routes.use('/v1', productVolumes_routes_1.default);
routes.use('/v1', productShelfLife_routes_1.default);
routes.use('/v1', productTypes_routes_1.default);
routes.use('/v1', productTargetGroups_routes_1.default);
routes.use('/v1', productWebOrders_routes_1.default);
routes.use('/v1', coolerTypes_routes_1.default);
routes.use('/v1', coolerSubTypes_routes_1.default);
routes.use('/v1', taxMaster_routes_1.default);
routes.use('/v1', batchLots_routes_1.default);
routes.use('/v1', inventoryItem_routes_1.default);
routes.use('/v1', subunits_routes_1.default);
routes.use('/v1', assetSubTypes_routes_1.default);
routes.use('/v1', templates_routes_1.default);
routes.use('/v1', columnPreference_routes_1.default);
routes.use('/v1', regions_routes_1.default);
routes.use('/v1', districts_routes_1.default);
routes.use('/v1', cities_routes_1.default);
routes.use('/v1', alerts_routes_1.default);
routes.use('/v1', customerCategoryGrading_routes_1.default);
routes.use('/v1', assetMaterBrands_routes_1.default);
routes.use('/v1', sap_routes_1.default);
routes.get('/', (_, res) => {
    res.json({
        name: 'DCC-SFA API',
        description: 'Sales Force Automation System - Backend API',
        version: 'v1.0.0',
        status: 'Running',
        developer: 'Ampleserv Developers',
        documentation: {
            health: 'GET /api/v1/health - Check API health status',
            endpoints: ['GET /api/v1/health - Health check endpoint'],
        },
        links: {
            frontend: 'http://localhost:5173',
            health: 'http://localhost:4000/api/v1/health',
            repository: 'https://github.com/manikantxampleserv/dcc-sfa',
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime().toFixed(2) + 's',
    });
});
routes.get('/v1/health', (_, res) => {
    res.json({
        status: 'OK',
        message: 'DCC SFA is alive, well-fed, and caffeinateds.',
        uptime: process.uptime().toFixed(2) + 's',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: 'v1.0.0',
        database: 'Connected',
        memoryUsage: process.memoryUsage().rss + ' bytes',
        developer: 'Ampleserv Developers',
    });
});
exports.default = routes;
//# sourceMappingURL=index.js.map