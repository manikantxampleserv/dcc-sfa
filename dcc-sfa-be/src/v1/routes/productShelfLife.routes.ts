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
import { productShelfLifeController } from '../controllers/productShelfLife.controller';
import { createProductShelfLifeValidation } from '../validations/productShelfLife.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-shelf-life',
  authenticateToken,
  auditCreate('product_shelf_life'),
  requirePermission([{ module: 'product-shelf-life', action: 'create' }]),
  createProductShelfLifeValidation,
  validate,
  productShelfLifeController.createProductShelfLife
);

router.get(
  '/product-shelf-life/:id',
  authenticateToken,
  requirePermission([{ module: 'product-shelf-life', action: 'read' }]),
  validate,
  productShelfLifeController.getProductShelfLifeById
);
router.get(
  '/product-shelf-life',
  authenticateToken,
  requirePermission([{ module: 'product-shelf-life', action: 'read' }]),
  productShelfLifeController.getProductShelfLife
);

router.put(
  '/product-shelf-life/:id',
  authenticateToken,
  auditUpdate('product_shelf_life'),
  requirePermission([{ module: 'product-shelf-life', action: 'update' }]),
  productShelfLifeController.updateProductShelfLife
);

router.delete(
  '/product-shelf-life/:id',
  authenticateToken,
  auditDelete('product_shelf_life'),
  requirePermission([{ module: 'product-shelf-life', action: 'delete' }]),
  productShelfLifeController.deleteProductShelfLife
);

export default router;
