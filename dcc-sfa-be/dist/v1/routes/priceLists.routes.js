"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const priceLists_controller_1 = require("../controllers/priceLists.controller");
const priceLists_validation_1 = require("../validations/priceLists.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/price-lists', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('price_lists'), (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'create' }]), priceLists_validation_1.createPriceListsValidation, validation_middleware_1.validate, priceLists_controller_1.priceListsController.upsertPriceList);
router.get('/price-lists/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'read' }]), priceLists_controller_1.priceListsController.getPriceListsById);
router.get('/price-lists', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'read' }]), priceLists_controller_1.priceListsController.getAllPriceLists);
router.delete('/price-lists/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('price_lists'), (0, auth_middleware_1.requirePermission)([{ module: 'pricelist', action: 'delete' }]), priceLists_controller_1.priceListsController.deletePriceLists);
exports.default = router;
//# sourceMappingURL=priceLists.routes.js.map