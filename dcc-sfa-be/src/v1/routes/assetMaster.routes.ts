import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { assetMasterController } from '../controllers/assetMaster.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/asset-master',
  authenticateToken,
  upload.array('assetImages', 10),
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
  assetMasterController.updateAssetMaster
);

router.delete(
  '/asset-master/:id',
  authenticateToken,
  assetMasterController.deleteAssetMaster
);

export default router;
