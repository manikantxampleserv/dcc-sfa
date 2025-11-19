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
import { assetMasterController } from '../controllers/assetMaster.controller';
import { upload } from '../../utils/multer';
import {
  createAssetMasterValidation,
  updateAssetMasterValidation,
} from '../validations/assetMaster.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/asset-master',
  authenticateToken,
  upload.array('assetImages', 10),
  auditCreate('asset_master'),
  requirePermission([{ module: 'asset-master', action: 'create' }]),
  createAssetMasterValidation,
  validate,
  assetMasterController.createAssetMaster
);

router.get(
  '/asset-master/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-master', action: 'read' }]),
  assetMasterController.getAssetMasterById
);
router.get(
  '/asset-master',
  authenticateToken,
  requirePermission([{ module: 'asset-master', action: 'read' }]),
  assetMasterController.getAllAssetMaster
);

router.put(
  '/asset-master/:id',
  authenticateToken,
  auditUpdate('asset_master'),
  requirePermission([{ module: 'asset-master', action: 'update' }]),
  updateAssetMasterValidation,
  validate,
  assetMasterController.updateAssetMaster
);

router.delete(
  '/asset-master/:id',
  authenticateToken,
  auditDelete('asset_master'),
  requirePermission([{ module: 'asset-master', action: 'delete' }]),
  assetMasterController.deleteAssetMaster
);

export default router;
