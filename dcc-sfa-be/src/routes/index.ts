import { Router } from 'express';

import customerCategoryGrading from '../v1/controllers/customerCategoryGrading.routes';
import ai from '../v1/routes/ai.routes';
import alerts from '../v1/routes/alerts.routes';
import apiTokens from '../v1/routes/apiTokens.routes';
import approvalWorkflows from '../v1/routes/approvalWorkflows.routes';
import approvalWorkflowSetup from '../v1/routes/approvalWorkflowSetup.routes';
import assetImages from '../v1/routes/assetImages.routes';
import assetMaintenance from '../v1/routes/assetMaintenance.routes';
import assetMaster from '../v1/routes/assetMaster.routes';
import assetMasterBrands from '../v1/routes/assetMaterBrands.routes';
import assetMovements from '../v1/routes/assetMovements.routes';
import assetSubTypes from '../v1/routes/assetSubTypes.routes';
import assetTypes from '../v1/routes/assetTypes.routes';
import assetWarrantyClaims from '../v1/routes/assetWarrantyClaims.routes';
import attendance from '../v1/routes/attendance.routes';
import auditLogs from '../v1/routes/auditLogs.routes';
import errorLogs from '../v1/routes/errorLogs.routes';
import auth from '../v1/routes/auth.routes';
import barcode from '../v1/routes/barcode.routes';
import batchLots from '../v1/routes/batchLots.routes';
import brandsRoutes from '../v1/routes/brands.routes';
import cities from '../v1/routes/cities.routes';
import columnPreference from '../v1/routes/columnPreference.routes';
import company from '../v1/routes/company.routes';
import competitorActivity from '../v1/routes/competitorActivity.routes';
import coolerInspections from '../v1/routes/coolerInspections.routes';
import coolerInstallations from '../v1/routes/coolerInstallations.routes';
import coolerSubTypes from '../v1/routes/coolerSubTypes.routes';
import coolerTypes from '../v1/routes/coolerTypes.routes';
import creditNotes from '../v1/routes/creditNotes.routes';
import creditNotesItems from '../v1/routes/creditNotesItems.routes';
import currencies from '../v1/routes/currencies.routes';
import customerAssets from '../v1/routes/customerAssets.routes';
import customerCategory from '../v1/routes/customerCategory.routes';
import customerChannel from '../v1/routes/customerChannels.routes';
import customerComplaints from '../v1/routes/customerComplaints.routes';
import customerDocuments from '../v1/routes/customerDocuments.routes';
import customerGroupMembers from '../v1/routes/customerGroupMembers.routes';
import customerGroups from '../v1/routes/customerGroups.routes';
import customers from '../v1/routes/customers.routes';
import customerType from '../v1/routes/customerTypes.routes';
import deliverySchedules from '../v1/routes/deliverySchedules.routes';
import depots from '../v1/routes/depots.routes';
import districts from '../v1/routes/districts.routes';
import executiveDashboard from '../v1/routes/executiveDashboard.routes';
import gpsTracking from '../v1/routes/gpsTracking.routes';
import importExport from '../v1/routes/import-export.routes';
import inventoryItemRoutes from '../v1/routes/inventoryItem.routes';
import inventoryStock from '../v1/routes/inventoryStock.routes';
import invoices from '../v1/routes/invoices.routes';
import kpiTargets from '../v1/routes/kpiTargets.routes';
import loginHistory from '../v1/routes/loginHistory.routes';
import notifications from '../v1/routes/notifications.routes';
import orderItems from '../v1/routes/orderItems.routes';
import orders from '../v1/routes/orders.routes';
import orgChart from '../v1/routes/orgChart.routes';
import payments from '../v1/routes/payments.routes';
import permissions from '../v1/routes/permissions.routes';
import priceLists from '../v1/routes/priceLists.routes';
import priceListsItems from '../v1/routes/priceListsItems.routes';
import productCategories from '../v1/routes/productCategories.routes';
import productFlavours from '../v1/routes/productFlavours.routes';
import products from '../v1/routes/products.routes';
import productShelfLife from '../v1/routes/productShelfLife.routes';
import productSubCategories from '../v1/routes/productSubCategories.routes';
import productTargetGroups from '../v1/routes/productTargetGroups.routes';
import productTypes from '../v1/routes/productTypes.routes';
import productVolumes from '../v1/routes/productVolumes.routes';
import productWebOrders from '../v1/routes/productWebOrders.routes';
import promotionParameters from '../v1/routes/promotionParameters.routes';
import promotionProducts from '../v1/routes/promotionProducts.routes';
import promotions from '../v1/routes/promotions.routes';
import regions from '../v1/routes/regions.routes';
import reports from '../v1/routes/reports.routes';
import requests from '../v1/routes/requests.routes';
import returnRequests from '../v1/routes/returnRequests.routes';
import rolePermissions from '../v1/routes/rolePermissions.routes';
import roles from '../v1/routes/roles.routes';
import route from '../v1/routes/route.routes';
import routePriceLists from '../v1/routes/routePriceLists.routes';
import routeTypes from '../v1/routes/routeTypes.routes';
import salesBonusRule from '../v1/routes/salesBonusRule.routes';
import salesTargetGroups from '../v1/routes/salesTargetGroups.routes';
import salesTargetOverrides from '../v1/routes/salesTargetOverrides.routes';
import salesTargets from '../v1/routes/salesTargets.routes';
import sapRoutes from '../v1/routes/sap.routes';
import settings from '../v1/routes/settings.routes';
import stockMovements from '../v1/routes/stockMovements.routes';
import stockTransferLines from '../v1/routes/stockTransferLines.routes';
import stockTransferRequests from '../v1/routes/stockTransferRequests.routes';
import subunitsRoutes from '../v1/routes/subunits.routes';
import surveyResponses from '../v1/routes/surveyResponses.routes';
import surveys from '../v1/routes/surveys.routes';
import taxMaster from '../v1/routes/taxMaster.routes';
import templates from '../v1/routes/templates.routes';
import unitOfMeasurementRoutes from '../v1/routes/unitOfMeasurement.routes';
import user from '../v1/routes/user.routes';
import vanInventory from '../v1/routes/vanInventory.routes';
import reconciliation from '../v1/routes/reconciliation.routes';
import vehicles from '../v1/routes/vehicles.routes';
import visits from '../v1/routes/visits.routes';
import visitTasks from '../v1/routes/visitTasks.routes';
import warehouses from '../v1/routes/warehouses.routes';
import workflow from '../v1/routes/workflow.routes';
import zones from '../v1/routes/zones.routes';

const routes = Router();


routes.use('/v1/org-chart', orgChart);
routes.use('/v1', barcode);
routes.use('/v1', ai);
routes.use('/v1', auth);
routes.use('/v1', user);
routes.use('/v1', roles);
routes.use('/v1', rolePermissions);
routes.use('/v1', permissions);
routes.use('/v1', company);
routes.use('/v1', depots);
routes.use('/v1', errorLogs);
routes.use('/v1', zones);
routes.use('/v1', importExport);
routes.use('/v1', route);
routes.use('/v1', visits);
routes.use('/v1', customers);
routes.use('/v1', orders);
routes.use('/v1', currencies);
routes.use('/v1', inventoryStock);
routes.use('/v1', products);
routes.use('/v1', customerGroups);
routes.use('/v1', assetTypes);
routes.use('/v1', assetMaster);
routes.use('/v1', warehouses);
routes.use('/v1', vehicles);
routes.use('/v1', customerGroupMembers);
routes.use('/v1', customerDocuments);
routes.use('/v1', surveys);
routes.use('/v1', assetImages);
routes.use('/v1', kpiTargets);
routes.use('/v1', priceLists);
routes.use('/v1', priceListsItems);
routes.use('/v1', routePriceLists);
routes.use('/v1', loginHistory);
routes.use('/v1', apiTokens);
routes.use('/v1', orderItems);
routes.use('/v1', salesTargetGroups);
routes.use('/v1', salesTargets);
routes.use('/v1', salesBonusRule);
routes.use('/v1', productCategories);
routes.use('/v1', productSubCategories);
routes.use('/v1', brandsRoutes);
routes.use('/v1', unitOfMeasurementRoutes);
routes.use('/v1', deliverySchedules);
routes.use('/v1', returnRequests);
routes.use('/v1', payments);
routes.use('/v1', invoices);
routes.use('/v1/workflow', workflow);
routes.use('/v1', creditNotes);
routes.use('/v1', creditNotesItems);
routes.use('/v1', assetMovements);
routes.use('/v1', assetMaintenance);
routes.use('/v1', competitorActivity);
routes.use('/v1', coolerInstallations);
routes.use('/v1', coolerInspections);
routes.use('/v1', assetWarrantyClaims);
routes.use('/v1', vanInventory);
routes.use('/v1', reconciliation);
routes.use('/v1', stockTransferRequests);
routes.use('/v1', stockTransferLines);
routes.use('/v1', stockMovements);
routes.use('/v1', salesTargetOverrides);
routes.use('/v1', customerAssets);
routes.use('/v1', visitTasks);
routes.use('/v1', promotions);
routes.use('/v1', promotionProducts);
routes.use('/v1', promotionParameters);
routes.use('/v1/reports', reports);
routes.use('/v1/tracking', gpsTracking);
routes.use('/v1', auditLogs);
routes.use('/v1', executiveDashboard);
routes.use('/v1/approval-workflows', approvalWorkflows);
routes.use('/v1/notifications', notifications);
routes.use('/v1', routeTypes);
routes.use('/v1', attendance);
routes.use('/v1', requests);
routes.use('/v1', approvalWorkflowSetup);
routes.use('/v1', surveyResponses);
routes.use('/v1', customerComplaints);
routes.use('/v1', settings);
routes.use('/v1', customerCategory);
routes.use('/v1', customerType);
routes.use('/v1', customerChannel);
routes.use('/v1', productFlavours);
routes.use('/v1', productVolumes);
routes.use('/v1', productShelfLife);
routes.use('/v1', productTypes);
routes.use('/v1', productTargetGroups);
routes.use('/v1', productWebOrders);
routes.use('/v1', coolerTypes);
routes.use('/v1', coolerSubTypes);
routes.use('/v1', taxMaster);
routes.use('/v1', batchLots);
routes.use('/v1', inventoryItemRoutes);
routes.use('/v1', subunitsRoutes);
routes.use('/v1', assetSubTypes);
routes.use('/v1', templates);
routes.use('/v1', columnPreference);
routes.use('/v1', regions);
routes.use('/v1', districts);
routes.use('/v1', cities);
routes.use('/v1', alerts);
routes.use('/v1', customerCategoryGrading);
routes.use('/v1', assetMasterBrands);
routes.use('/v1', sapRoutes);

routes.get('/', (_: any, res: any) => {
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

routes.get('/v1/health', (_: any, res: any) => {
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

export default routes;
