"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const customerAssets_controller_1 = require("../controllers/customerAssets.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const customerAssets_validation_1 = require("../validations/customerAssets.validation");
const router = (0, express_1.Router)();
router.post('/customer-assets', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customer_assets'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'create' }]), customerAssets_validation_1.createCustomerAssetValidation, validation_middleware_1.validate, customerAssets_controller_1.customerAssetsController.createCustomerAsset);
router.get('/customer-assets', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'read' }]), customerAssets_controller_1.customerAssetsController.getAllCustomerAssets);
router.get('/customer-assets/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'read' }]), customerAssets_controller_1.customerAssetsController.getCustomerAssetById);
router.put('/customer-assets/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('customer_assets'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'update' }]), customerAssets_controller_1.customerAssetsController.updateCustomerAsset);
router.delete('/customer-assets/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customer_assets'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'delete' }]), customerAssets_controller_1.customerAssetsController.deleteCustomerAsset);
exports.default = router;
//# sourceMappingURL=customerAssets.routes.js.map