"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const assetMaintenance_controller_1 = require("../controllers/assetMaintenance.controller");
const assetMaintenance_validation_1 = require("../validations/assetMaintenance.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
/**
 * Route: Summary statistics for top KPI cards.
 */
router.get('/asset-maintenance/stats/dashboard', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'read' }]), assetMaintenance_controller_1.assetMaintenanceController.getMaintenanceDashboardStats);
/**
 * Route: Create a new maintenance record.
 */
router.post('/asset-maintenance', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'create' }]), assetMaintenance_validation_1.createAssetMaintenanceValidation, validation_middleware_1.validate, assetMaintenance_controller_1.assetMaintenanceController.createAssetMaintenance);
/**
 * Route: Assign technician and priority to a maintenance job (supports both PUT and POST).
 */
router.put('/asset-maintenance/:id/assign', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.assignTechnician);
router.post('/asset-maintenance/:id/assign', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.assignTechnician);
/**
 * Route: Submit repair results from mobile app or web (supports both PUT and POST, repair and repair-result).
 */
router.put('/asset-maintenance/:id/repair-result', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.submitMobileRepairResult);
router.post('/asset-maintenance/:id/repair-result', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.submitMobileRepairResult);
router.put('/asset-maintenance/:id/repair', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.submitMobileRepairResult);
router.post('/asset-maintenance/:id/repair', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.submitMobileRepairResult);
/**
 * Route: Close a maintenance job with verified spares and labour costs (supports both PUT and POST).
 */
router.put('/asset-maintenance/:id/close', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.closeMaintenanceJob);
router.post('/asset-maintenance/:id/close', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.closeMaintenanceJob);
/**
 * Route: Get single maintenance record by ID.
 */
router.get('/asset-maintenance/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'read' }]), assetMaintenance_controller_1.assetMaintenanceController.getAssetMaintenanceById);
/**
 * Route: Get paginated maintenance records.
 */
router.get('/asset-maintenance', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'read' }]), assetMaintenance_controller_1.assetMaintenanceController.getAllAssetMaintenance);
/**
 * Route: Update an existing maintenance record.
 */
router.put('/asset-maintenance/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetMaintenance_controller_1.assetMaintenanceController.updateAssetMaintenance);
/**
 * Route: Delete a maintenance record.
 */
router.delete('/asset-maintenance/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('asset_maintenance'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'delete' }]), assetMaintenance_controller_1.assetMaintenanceController.deleteAssetMaintenance);
exports.default = router;
//# sourceMappingURL=assetMaintenance.routes.js.map