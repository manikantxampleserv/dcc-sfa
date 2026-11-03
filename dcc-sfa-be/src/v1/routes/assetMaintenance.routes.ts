import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { assetMaintenanceController } from '../controllers/assetMaintenance.controller';
import { createAssetMaintenanceValidation } from '../validations/assetMaintenance.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

/**
 * Route: Summary statistics for top KPI cards.
 */
router.get(
  '/asset-maintenance/stats/dashboard',
  authenticateToken,
  requirePermission([{ module: 'maintenance', action: 'read' }]),
  assetMaintenanceController.getMaintenanceDashboardStats
);

/**
 * Route: Create a new maintenance record.
 */
router.post(
  '/asset-maintenance',
  authenticateToken,
  auditCreate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'create' }]),
  createAssetMaintenanceValidation,
  validate,
  assetMaintenanceController.createAssetMaintenance
);

/**
 * Route: Assign technician and priority to a maintenance job (supports both PUT and POST).
 */
router.put(
  '/asset-maintenance/:id/assign',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.assignTechnician
);
router.post(
  '/asset-maintenance/:id/assign',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.assignTechnician
);

/**
 * Route: Submit repair results from mobile app or web (supports both PUT and POST, repair and repair-result).
 */
router.put(
  '/asset-maintenance/:id/repair-result',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.submitMobileRepairResult
);
router.post(
  '/asset-maintenance/:id/repair-result',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.submitMobileRepairResult
);
router.put(
  '/asset-maintenance/:id/repair',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.submitMobileRepairResult
);
router.post(
  '/asset-maintenance/:id/repair',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.submitMobileRepairResult
);

/**
 * Route: Close a maintenance job with verified spares and labour costs (supports both PUT and POST).
 */
router.put(
  '/asset-maintenance/:id/close',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.closeMaintenanceJob
);
router.post(
  '/asset-maintenance/:id/close',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.closeMaintenanceJob
);

/**
 * Route: Get single maintenance record by ID.
 */
router.get(
  '/asset-maintenance/:id',
  authenticateToken,
  requirePermission([{ module: 'maintenance', action: 'read' }]),
  assetMaintenanceController.getAssetMaintenanceById
);

/**
 * Route: Get paginated maintenance records.
 */
router.get(
  '/asset-maintenance',
  authenticateToken,
  requirePermission([{ module: 'maintenance', action: 'read' }]),
  assetMaintenanceController.getAllAssetMaintenance
);

/**
 * Route: Update an existing maintenance record.
 */
router.put(
  '/asset-maintenance/:id',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.updateAssetMaintenance
);

/**
 * Route: Delete a maintenance record.
 */
router.delete(
  '/asset-maintenance/:id',
  authenticateToken,
  auditDelete('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'delete' }]),
  assetMaintenanceController.deleteAssetMaintenance
);

export default router;
