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
import { assetImagesController } from '../controllers/assetImages.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/asset-images',
  upload.single('file'),
  authenticateToken,
  auditCreate('asset_images'),
  requirePermission([{ module: 'asset-master', action: 'create' }]),
  assetImagesController.createAssetImages
);

router.get(
  '/asset-images/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-master', action: 'read' }]),
  assetImagesController.getAssetImagesById
);
router.get(
  '/asset-images',
  authenticateToken,
  requirePermission([{ module: 'asset-master', action: 'read' }]),
  assetImagesController.getAllAssetImages
);

router.put(
  '/asset-images/:id',
  upload.single('file'),
  authenticateToken,
  auditUpdate('asset_images'),
  requirePermission([{ module: 'asset-master', action: 'update' }]),
  assetImagesController.updateAssetImages
);

router.delete(
  '/asset-images/:id',
  authenticateToken,
  auditDelete('asset_images'),
  requirePermission([{ module: 'asset-master', action: 'delete' }]),
  assetImagesController.deleteAssetImages
);

export default router;
