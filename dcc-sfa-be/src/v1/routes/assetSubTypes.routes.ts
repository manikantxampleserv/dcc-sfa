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
  auditCreate('asset_sub_types'),
  validate,
  assetSubTypesController.createAssetSubType
);

router.get(
  '/asset-sub-types/:id',
  authenticateToken,
  // requirePermission([{ module: 'asset-sub-type', action: 'read' }]),
  validate,
  assetSubTypesController.getAssetSubTypeById
);

router.get(
  '/asset-sub-types',
  authenticateToken,
  // requirePermission([{ module: 'asset-sub-type', action: 'read' }]),
  assetSubTypesController.getAssetSubTypes
);

router.get(
  '/asset-sub-types-dropdown',
  authenticateToken,
  assetSubTypesController.getAssetSubTypesDropdown
);

router.put(
  '/asset-sub-types/:id',
  authenticateToken,
  auditUpdate('asset_sub_types'),
  // requirePermission([{ module: 'asset-sub-type', action: 'update' }]),
  assetSubTypesController.updateAssetSubType
);

router.delete(
  '/asset-sub-types/:id',
  authenticateToken,
  auditDelete('asset_sub_types'),
  // requirePermission([{ module: 'asset-sub-type', action: 'delete' }]),
  assetSubTypesController.deleteAssetSubType
);

export default router;
