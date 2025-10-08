import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { assetTypesController } from '../controllers/assetTypes.controller';
import { createAssetTypeValidation } from '../validations/assetTypes.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/asset-types',
  authenticateToken,
  createAssetTypeValidation,
  validate,
  assetTypesController.createAssetType
);

router.get(
  '/asset-types/:id',
  authenticateToken,
  validate,
  assetTypesController.getAssetTypeById
);
router.get(
  '/asset-types',
  authenticateToken,
  assetTypesController.getAssetTypes
);

router.put(
  '/asset-types/:id',
  authenticateToken,
  assetTypesController.updateAssetType
);

router.delete(
  '/asset-types/:id',
  authenticateToken,
  assetTypesController.deleteAssetType
);

export default router;
