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
import { productsController } from '../controllers/products.controller';
import { createProductValidation } from '../validations/products.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/products',
  authenticateToken,
  auditCreate('products'),
  requirePermission([{ module: 'product', action: 'create' }]),
  createProductValidation,
  validate,
  productsController.createProduct
);

router.get(
  '/products',
  authenticateToken,
  requirePermission([{ module: 'product', action: 'read' }]),
  productsController.getAllProducts
);

router.put(
  '/products/:id',
  authenticateToken,
  auditUpdate('products'),
  requirePermission([{ module: 'product', action: 'update' }]),
  productsController.updateProduct
);
router.get(
  '/products/:id',
  authenticateToken,
  requirePermission([{ module: 'product', action: 'read' }]),
  productsController.getProductById
);

router.delete(
  '/products/:id',
  authenticateToken,
  auditDelete('products'),
  requirePermission([{ module: 'product', action: 'delete' }]),
  productsController.deleteProduct
);

router.get(
  '/products-dropdown',
  authenticateToken,
  productsController.getProductDropdown
);

export default router;
