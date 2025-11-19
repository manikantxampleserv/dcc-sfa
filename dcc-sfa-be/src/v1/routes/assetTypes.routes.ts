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
import { assetTypesController } from '../controllers/assetTypes.controller';
import { createAssetTypeValidation } from '../validations/assetTypes.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/asset-types',
  authenticateToken,
  auditCreate('asset_types'),
  requirePermission([{ module: 'asset-type', action: 'create' }]),
  createAssetTypeValidation,
  validate,
  assetTypesController.createAssetType
);

router.get(
  '/asset-types/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-type', action: 'read' }]),
  validate,
  assetTypesController.getAssetTypeById
);
router.get(
  '/asset-types',
  authenticateToken,
  requirePermission([{ module: 'asset-type', action: 'read' }]),
  assetTypesController.getAssetTypes
);

router.put(
  '/asset-types/:id',
  authenticateToken,
  auditUpdate('asset_types'),
  requirePermission([{ module: 'asset-type', action: 'update' }]),
  assetTypesController.updateAssetType
);

router.delete(
  '/asset-types/:id',
  authenticateToken,
  auditDelete('asset_types'),
  requirePermission([{ module: 'asset-type', action: 'delete' }]),
  assetTypesController.deleteAssetType
);

export default router;
