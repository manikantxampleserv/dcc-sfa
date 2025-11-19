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
import { customerAssetsController } from '../controllers/customerAssets.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createCustomerAssetValidation } from '../validations/customerAssets.validation';

const router = Router();

router.post(
  '/customer-assets',
  authenticateToken,
  auditCreate('customer_assets'),
  requirePermission([{ module: 'asset-master', action: 'create' }]),
  createCustomerAssetValidation,
  validate,
  customerAssetsController.createCustomerAsset
);
router.get(
  '/customer-assets',
  authenticateToken,
  requirePermission([{ module: 'asset-master', action: 'read' }]),
  customerAssetsController.getAllCustomerAssets
);
router.get(
  '/customer-assets/:id',
  authenticateToken,
  requirePermission([{ module: 'asset-master', action: 'read' }]),
  customerAssetsController.getCustomerAssetById
);
router.put(
  '/customer-assets/:id',
  authenticateToken,
  auditUpdate('customer_assets'),
  requirePermission([{ module: 'asset-master', action: 'update' }]),
  customerAssetsController.updateCustomerAsset
);
router.delete(
  '/customer-assets/:id',
  authenticateToken,
  auditDelete('customer_assets'),
  requirePermission([{ module: 'asset-master', action: 'delete' }]),
  customerAssetsController.deleteCustomerAsset
);

export default router;
