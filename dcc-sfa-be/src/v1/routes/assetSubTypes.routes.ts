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
import { assetSubTypesController } from '../controllers/assetSubTypes.controller';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/asset-sub-types',
  authenticateToken,
  requirePermission([{ module: 'asset-sub-types', action: 'create' }]),
  auditCreate('asset_sub_types'),
  validate,
  assetSubTypesController.createAssetSubType
);

router.get(
  '/asset-sub-types/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-sub-types', action: 'read' }]),
  validate,
  assetSubTypesController.getAssetSubTypeById
);

router.get(
  '/asset-sub-types',
  authenticateToken,
  requirePermission([{ module: 'asset-sub-types', action: 'read' }]),
  assetSubTypesController.getAssetSubTypes
);

router.get(
  '/asset-sub-types-dropdown',
  authenticateToken,
  requirePermission([{ module: 'asset-sub-types', action: 'read' }]),
  assetSubTypesController.getAssetSubTypesDropdown
);

router.put(
  '/asset-sub-types/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-sub-types', action: 'update' }]),
  auditUpdate('asset_sub_types'),
  assetSubTypesController.updateAssetSubType
);

router.delete(
  '/asset-sub-types/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-sub-types', action: 'delete' }]),
  auditDelete('asset_sub_types'),
  assetSubTypesController.deleteAssetSubType
);

export default router;
