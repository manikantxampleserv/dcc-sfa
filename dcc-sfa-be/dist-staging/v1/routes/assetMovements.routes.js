"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const assetMovements_controller_1 = require("../controllers/assetMovements.controller");
const assetMovements_validation_1 = require("../validations/assetMovements.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/asset-movement', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('asset_movements'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-movement', action: 'create' }]), assetMovements_validation_1.createAssetMovementsValidation, validation_middleware_1.validate, assetMovements_controller_1.assetMovementsController.createAssetMovements);
router.get('/asset-movement/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-movement', action: 'read' }]), assetMovements_controller_1.assetMovementsController.getAssetMovementsById);
router.get('/asset-movement', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-movement', action: 'read' }]), assetMovements_controller_1.assetMovementsController.getAllAssetMovements);
router.put('/asset-movement/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_movements'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-movement', action: 'update' }]), assetMovements_controller_1.assetMovementsController.updateAssetMovements);
router.delete('/asset-movement/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('asset_movements'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-movement', action: 'delete' }]), assetMovements_controller_1.assetMovementsController.deleteAssetMovements);
exports.default = router;
//# sourceMappingURL=assetMovements.routes.js.map