import { Router } from 'express';
import { assetBrandsController } from '../controllers/assetBrands.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { auditCreate, auditUpdate } from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/asset-master-brands',
  authenticateToken,
  auditCreate('asset_master_brands'),
  assetBrandsController.createAssetBrand
);

router.get(
  '/asset-master-brands',
  authenticateToken,
  requirePermission([{ module: 'asset-brand', action: 'read' }]),
  assetBrandsController.getAssetBrands
);

router.get(
  '/asset-master-brands/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-brand', action: 'read' }]),
  assetBrandsController.getAssetBrandById
);

router.put(
  '/asset-master-brands/:id',
  authenticateToken,
  auditUpdate('asset_master_brands'),
  requirePermission([{ module: 'asset-brand', action: 'update' }]),
  assetBrandsController.updateAssetBrand
);

router.delete(
  '/asset-master-brands/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-brand', action: 'delete' }]),
  assetBrandsController.deleteAssetBrand
);

export default router;
