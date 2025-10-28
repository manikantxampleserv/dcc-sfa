import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createAssetMaintenanceValidation,
  validate,
  assetMaintenanceController.createAssetMaintenance
);

router.get(
  '/asset-maintenance/:id',
  authenticateToken,
  assetMaintenanceController.getAssetMaintenanceById
);
router.get(
  '/asset-maintenance',
  authenticateToken,
  assetMaintenanceController.getAllAssetMaintenance
);

router.put(
  '/asset-maintenance/:id',
  authenticateToken,
  auditUpdate('asset_maintenance'),
  assetMaintenanceController.updateAssetMaintenance
);

router.delete(
  '/asset-maintenance/:id',
  authenticateToken,
  auditDelete('asset_maintenance'),
  assetMaintenanceController.deleteAssetMaintenance
);

export default router;
