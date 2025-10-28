import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { assetImagesController } from '../controllers/assetImages.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/asset-images',
  upload.single('file'),
  authenticateToken,
  auditCreate('asset_images'),
  assetImagesController.createAssetImages
);

router.get(
  '/asset-images/:id',
  authenticateToken,
  assetImagesController.getAssetImagesById
);
router.get(
  '/asset-images',
  authenticateToken,
  assetImagesController.getAllAssetImages
);

router.put(
  '/asset-images/:id',
  upload.single('file'),
  authenticateToken,
  auditUpdate('asset_images'),
  assetImagesController.updateAssetImages
);

router.delete(
  '/asset-images/:id',
  authenticateToken,
  auditDelete('asset_images'),
  assetImagesController.deleteAssetImages
);

export default router;
