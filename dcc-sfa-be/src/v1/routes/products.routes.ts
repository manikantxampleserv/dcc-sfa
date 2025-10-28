import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createProductValidation,
  validate,
  productsController.createProduct
);

router.get('/products', authenticateToken, productsController.getAllProducts);

router.put(
  '/products/:id',
  authenticateToken,
  auditUpdate('products'),
  productsController.updateProduct
);
router.get(
  '/products/:id',
  authenticateToken,
  productsController.getProductById
);

router.delete(
  '/products/:id',
  authenticateToken,
  auditDelete('products'),
  productsController.deleteProduct
);

export default router;
