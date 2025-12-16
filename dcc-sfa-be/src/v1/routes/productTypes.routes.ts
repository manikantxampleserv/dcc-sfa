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
import { productTypesController } from '../controllers/productTypes.controller';
import { createProductTypeValidation } from '../validations/productTypes.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-types',
  authenticateToken,
  auditCreate('product_type'),
  requirePermission([{ module: 'product-type', action: 'create' }]),
  createProductTypeValidation,
  validate,
  productTypesController.createProductType
);

router.get(
  '/product-types/:id',
  authenticateToken,
  requirePermission([{ module: 'product-type', action: 'read' }]),
  validate,
  productTypesController.getProductTypeById
);
router.get(
  '/product-types',
  authenticateToken,
  requirePermission([{ module: 'product-type', action: 'read' }]),
  productTypesController.getProductTypes
);

router.put(
  '/product-types/:id',
  authenticateToken,
  auditUpdate('product_type'),
  requirePermission([{ module: 'product-type', action: 'update' }]),
  productTypesController.updateProductType
);

router.delete(
  '/product-types/:id',
  authenticateToken,
  auditDelete('product_type'),
  requirePermission([{ module: 'product-type', action: 'delete' }]),
  productTypesController.deleteProductType
);

router.get(
  '/product-types-dropdown',
  authenticateToken,
  productTypesController.getProductTypesDropdown
);

export default router;
