import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { productsController } from '../controllers/products.controller';
import { createProductValidation } from '../validations/products.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/products',
  authenticateToken,
  createProductValidation,
  validate,
  productsController.createProduct
);

router.get('/products', authenticateToken, productsController.getAllProducts);

router.put(
  '/products/:id',
  authenticateToken,
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
  productsController.deleteProduct
);

export default router;
