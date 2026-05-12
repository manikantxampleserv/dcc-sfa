"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const routePriceList_controller_1 = require("../controllers/routePriceList.controller");
// import { createPriceListItemsValidation } from '../validations/priceListItems.validation';
// import { validate } from '../../middlewares/validation.middleware';
const router = (0, express_1.Router)();
router.post('/route-price-list', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('route_price_lists'), (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'create' }]), 
// createPriceListItemsValidation,
// validate,
routePriceList_controller_1.routePriceListController.createRoutePriceList);
router.get('/route-price-list/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'read' }]), routePriceList_controller_1.routePriceListController.getRoutePriceListById);
router.get('/route-price-list', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'read' }]), routePriceList_controller_1.routePriceListController.getAllRoutePriceList);
router.put('/route-price-list/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('route_price_lists'), (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'update' }]), routePriceList_controller_1.routePriceListController.updateRoutePriceList);
router.delete('/route-price-list/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('route_price_lists'), (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'delete' }]), routePriceList_controller_1.routePriceListController.deleteRoutePriceList);
exports.default = router;
//# sourceMappingURL=routePriceLists.routes.js.map