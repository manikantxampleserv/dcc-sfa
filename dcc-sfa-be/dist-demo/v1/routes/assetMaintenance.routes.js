"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const assetMaintenance_controller_1 = require("../controllers/assetMaintenance.controller");
const assetMaintenance_validation_1 = require("../validations/assetMaintenance.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/asset-maintenance', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'create' }]), assetMaintenance_validation_1.createAssetMaintenanceValidation, validation_middleware_1.validate, assetMaintenance_controller_1.assetMaintenanceController.createAssetMaintenance);
router.get('/asset-maintenance/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'read' }]), assetMaintenance_controller_1.assetMaintenanceController.getAssetMaintenanceById);
router.get('/asset-maintenance', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'read' }]), assetMaintenance_controller_1.assetMaintenanceController.getAllAssetMaintenance);
router.put('/asset-maintenance/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.updateAssetMaintenance);
router.delete('/asset-maintenance/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'delete' }]), assetMaintenance_controller_1.assetMaintenanceController.deleteAssetMaintenance);
exports.default = router;
//# sourceMappingURL=assetMaintenance.routes.js.map