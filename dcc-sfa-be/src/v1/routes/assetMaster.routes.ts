import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createAssetMasterValidation,
  validate,
  assetMasterController.createAssetMaster
);

router.get(
  '/asset-master/:id',
  authenticateToken,
  assetMasterController.getAssetMasterById
);
router.get(
  '/asset-master',
  authenticateToken,
  assetMasterController.getAllAssetMaster
);

router.put(
  '/asset-master/:id',
  authenticateToken,
  updateAssetMasterValidation,
  validate,
  assetMasterController.updateAssetMaster
);

router.delete(
  '/asset-master/:id',
  authenticateToken,
  assetMasterController.deleteAssetMaster
);

export default router;
