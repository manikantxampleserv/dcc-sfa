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
import productCategoriesRoutes from '../v1/routes/productCategories.routes';
import productSubCategoriesRoutes from '../v1/routes/productSubCategories.routes';

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
routes.use('/v1', productCategoriesRoutes);
routes.use('/v1', productSubCategoriesRoutes);

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
