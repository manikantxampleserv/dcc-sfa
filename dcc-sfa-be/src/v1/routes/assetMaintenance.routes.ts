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

router.post(
  '/asset-maintenance',
  authenticateToken,
  auditCreate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'create' }]),
  createAssetMaintenanceValidation,
  validate,
  assetMaintenanceController.createAssetMaintenance
);

router.get(
  '/asset-maintenance/:id',
  authenticateToken,
  requirePermission([{ module: 'maintenance', action: 'read' }]),
  assetMaintenanceController.getAssetMaintenanceById
);
router.get(
  '/asset-maintenance',
  authenticateToken,
  requirePermission([{ module: 'maintenance', action: 'read' }]),
  assetMaintenanceController.getAllAssetMaintenance
);

router.put(
  '/asset-maintenance/:id',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'update' }]),
  assetMaintenanceController.updateAssetMaintenance
);

router.delete(
  '/asset-maintenance/:id',
  authenticateToken,
  auditDelete('asset_maintenance'),
  requirePermission([{ module: 'maintenance', action: 'delete' }]),
  assetMaintenanceController.deleteAssetMaintenance
);

export default router;
