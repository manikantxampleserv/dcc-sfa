"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const assetTypes_controller_1 = require("../controllers/assetTypes.controller");
const assetTypes_validation_1 = require("../validations/assetTypes.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/asset-types', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('asset_types'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-type', action: 'create' }]), assetTypes_validation_1.createAssetTypeValidation, validation_middleware_1.validate, assetTypes_controller_1.assetTypesController.createAssetType);
router.get('/asset-types/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-type', action: 'read' }]), validation_middleware_1.validate, assetTypes_controller_1.assetTypesController.getAssetTypeById);
router.get('/asset-types', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-type', action: 'read' }]), assetTypes_controller_1.assetTypesController.getAssetTypes);
router.put('/asset-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_types'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-type', action: 'update' }]), assetTypes_controller_1.assetTypesController.updateAssetType);
router.delete('/asset-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('asset_types'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-type', action: 'delete' }]), assetTypes_controller_1.assetTypesController.deleteAssetType);
exports.default = router;
//# sourceMappingURL=assetTypes.routes.js.map