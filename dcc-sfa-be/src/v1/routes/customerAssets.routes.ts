import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { customerAssetsController } from '../controllers/customerAssets.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createCustomerAssetValidation } from '../validations/customerAssets.validation';

const router = Router();

router.post(
  '/customer-assets',
  authenticateToken,
  auditCreate('customer_assets'),
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
  auditUpdate('customer_assets'),
  customerAssetsController.updateCustomerAsset
);
router.delete(
  '/customer-assets/:id',
  authenticateToken,
  auditDelete('customer_assets'),
  customerAssetsController.deleteCustomerAsset
);

export default router;
