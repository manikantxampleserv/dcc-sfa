import { Router } from 'express';
import { assetBrandsController } from '../controllers/assetBrands.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/asset-master-brands',
  authenticateToken,
  assetBrandsController.createAssetBrand
);
router.get(
  '/asset-master-brands',
  authenticateToken,
  assetBrandsController.getAssetBrands
);

router.get(
  '/asset-master-brands/:id',
  authenticateToken,
  assetBrandsController.getAssetBrandById
);
router.put(
  '/asset-master-brands/:id',
  authenticateToken,
  assetBrandsController.updateAssetBrand
);
router.delete(
  '/asset-master-brands/:id',
  authenticateToken,
  assetBrandsController.deleteAssetBrand
);

export default router;
