import { Router, Request, Response } from 'express';

import user from '../v1/routes/user.routes';
import auth from '../v1/routes/auth.routes';
import roles from '../v1/routes/roles.routes';
import rolePermissions from '../v1/routes/rolePermissions.routes';
import permissions from '../v1/routes/permissions.routes';
import company from '../v1/routes/company.routes';
import depots from '../v1/routes/depots.routes';
import zones from '../v1/routes/zones.routes';
import importExport from '../v1/routes/import-export.routes';
import route from '../v1/routes/route.routes';
import visits from '../v1/routes/visits.routes';
import customers from '../v1/routes/customers.routes';
import orders from '../v1/routes/orders.routes';
import currencies from '../v1/routes/currencies.routes';
import inventoryStock from '../v1/routes/inventoryStock.routes';
import products from '../v1/routes/products.routes';
import customerGroups from '../v1/routes/customerGroups.routes';
import assetTypes from '../v1/routes/assetTypes.routes';
import assetMaster from '../v1/routes/assetMaster.routes';
import warehouses from '../v1/routes/warehouses.routes';
import vehicles from '../v1/routes/vehicles.routes';
import customerGroupMembers from '../v1/routes/customerGroupMembers.routes';
import customerDocuments from '../v1/routes/customerDocuments.routes';
import surveys from '../v1/routes/surveys.routes';
import assetImages from '../v1/routes/assetImages.routes';
import kpiTargets from '../v1/routes/kpiTargets.routes';
import priceLists from '../v1/routes/priceLists.routes';
import priceListsItems from '../v1/routes/priceListsItems.routes';
import routePriceLists from '../v1/routes/routePriceLists.routes';
import loginHistory from '../v1/routes/loginHistory.routes';
import apiTokens from '../v1/routes/apiTokens.routes';
import orderItems from '../v1/routes/orderItems.routes';
import salesTargetGroups from '../v1/routes/salesTargetGroups.routes';
import salesTargets from '../v1/routes/salesTargets.routes';
import salesBonusRule from '../v1/routes/salesBonusRule.routes';
import productCategories from '../v1/routes/productCategories.routes';
import productSubCategories from '../v1/routes/productSubCategories.routes';
import brandsRoutes from '../v1/routes/brands.routes';
import unitOfMeasurementRoutes from '../v1/routes/unitOfMeasurement.routes';
import deliverySchedules from '../v1/routes/deliverySchedules.routes';
import returnRequests from '../v1/routes/returnRequests.routes';
import payments from '../v1/routes/payments.routes';
import invoices from '../v1/routes/invoices.routes';
import workflow from '../v1/routes/workflow.routes';
import creditNotes from '../v1/routes/creditNotes.routes';
import creditNotesItems from '../v1/routes/creditNotesItems.routes';
import assetMovements from '../v1/routes/assetMovements.routes';
import assetMaintenance from '../v1/routes/assetMaintenance.routes';
import competitorActivity from '../v1/routes/competitorActivity.routes';
import coolerInstallations from '../v1/routes/coolerInstallations.routes';
import coolerInspections from '../v1/routes/coolerInspections.routes';
import assetWarrantyClaims from '../v1/routes/assetWarrantyClaims.routes';
import vanInventory from '../v1/routes/vanInventory.routes';
import stockTransferRequests from '../v1/routes/stockTransferRequests.routes';
import stockTransferLines from '../v1/routes/stockTransferLines.routes';
import stockMovements from '../v1/routes/stockMovements.routes';
import salesTargetOverrides from '../v1/routes/salesTargetOverrides.routes';
import customerAssets from '../v1/routes/customerAssets.routes';
import visitTasks from '../v1/routes/visitTasks.routes';
import promotions from '../v1/routes/promotions.routes';
import promotionParameters from '../v1/routes/promotionParameters.routes';
import promotionProducts from '../v1/routes/promotionProducts.routes';
import reports from '../v1/routes/reports.routes';
import gpsTracking from '../v1/routes/gpsTracking.routes';
import auditLogs from '../v1/routes/auditLogs.routes';
import executiveDashboard from '../v1/routes/executiveDashboard.routes';
import approvalWorkflows from '../v1/routes/approvalWorkflows.routes';
import notifications from '../v1/routes/notifications.routes';
import routeTypes from '../v1/routes/routeTypes.routes';
import attendance from '../v1/routes/attendance.routes';
import requests from '../v1/routes/requests.routes';
import approvalWorkflowSetup from '../v1/routes/approvalWorkflowSetup.routes';
import surveyResponses from '../v1/routes/surveyResponses.routes';
import customerComplaints from '../v1/routes/customerComplaints.routes';
import settings from '../v1/routes/settings.routes';
import customerCategory from '../v1/routes/customerCategory.routes';
import customerType from '../v1/routes/customerTypes.routes';
import customerChannel from '../v1/routes/customerChannels.routes';

const routes = Router();

routes.use('/v1', auth);
routes.use('/v1', user);
routes.use('/v1', roles);
routes.use('/v1', rolePermissions);
routes.use('/v1', permissions);
routes.use('/v1', company);
routes.use('/v1', depots);
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
    message: 'DCC SFA is alive, well-fed, and caffeinated.',
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
