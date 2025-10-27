import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { customerAssetsController } from '../controllers/customerAssets.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createCustomerAssetValidation } from '../validations/customerAssets.validation';

const router = Router();

router.post(
  '/customer-assets',
  authenticateToken,
  createCustomerAssetValidation,
  validate,
  customerAssetsController.createCustomerAsset
);
router.get(
  '/customer-assets',
  authenticateToken,
  customerAssetsController.getAllCustomerAssets
);
router.get(
  '/customer-assets/:id',
  authenticateToken,
  customerAssetsController.getCustomerAssetById
);
router.put(
  '/customer-assets/:id',
  authenticateToken,
  customerAssetsController.updateCustomerAsset
);
router.delete(
  '/customer-assets/:id',
  authenticateToken,
  customerAssetsController.deleteCustomerAsset
);

export default router;
