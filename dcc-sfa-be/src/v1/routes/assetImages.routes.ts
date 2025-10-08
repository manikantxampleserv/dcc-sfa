import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { assetImagesController } from '../controllers/assetImages.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/asset-images',
  upload.single('file'),
  authenticateToken,
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
  assetImagesController.updateAssetImages
);

router.delete(
  '/asset-images/:id',
  authenticateToken,
  assetImagesController.deleteAssetImages
);

export default router;
