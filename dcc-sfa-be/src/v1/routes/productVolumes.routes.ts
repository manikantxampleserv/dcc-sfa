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
import { productVolumesController } from '../controllers/productVolumes.controller';
import { createProductVolumeValidation } from '../validations/productVolumes.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-volumes',
  authenticateToken,
  auditCreate('product_volumes'),
  requirePermission([{ module: 'product-volume', action: 'create' }]),
  createProductVolumeValidation,
  validate,
  productVolumesController.createProductVolume
);

router.get(
  '/product-volumes/:id',
  authenticateToken,
  requirePermission([{ module: 'product-volume', action: 'read' }]),
  validate,
  productVolumesController.getProductVolumeById
);
router.get(
  '/product-volumes',
  authenticateToken,
  requirePermission([{ module: 'product-volume', action: 'read' }]),
  productVolumesController.getProductVolumes
);

router.put(
  '/product-volumes/:id',
  authenticateToken,
  auditUpdate('product_volumes'),
  requirePermission([{ module: 'product-volume', action: 'update' }]),
  productVolumesController.updateProductVolume
);

router.delete(
  '/product-volumes/:id',
  authenticateToken,
  auditDelete('product_volumes'),
  requirePermission([{ module: 'product-volume', action: 'delete' }]),
  productVolumesController.deleteProductVolume
);

router.get(
  '/product-volumes-dropdown',
  authenticateToken,
  productVolumesController.getProductVolumesDropdown
);

export default router;
