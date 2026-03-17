"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const priceListsItems_controller_1 = require("../controllers/priceListsItems.controller");
const priceListItems_validation_1 = require("../validations/priceListItems.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.post('/price-list-items', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('price_list_items'), (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'create' }]), priceListItems_validation_1.createPriceListItemsValidation, validation_middleware_1.validate, priceListsItems_controller_1.priceListItemsController.createPriceListItems);
router.get('/price-list-items/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'read' }]), priceListsItems_controller_1.priceListItemsController.getPriceListItemsById);
router.get('/price-list-items', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'read' }]), priceListsItems_controller_1.priceListItemsController.getAllPriceListItems);
router.put('/price-list-items/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('price_list_items'), (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'update' }]), priceListItems_validation_1.updatePriceListItemsValidation, validation_middleware_1.validate, priceListsItems_controller_1.priceListItemsController.updatePriceListItems);
router.delete('/price-list-items/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('price_list_items'), (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'delete' }]), priceListsItems_controller_1.priceListItemsController.deletePriceListItems);
exports.default = router;
//# sourceMappingURL=priceListsItems.routes.js.map