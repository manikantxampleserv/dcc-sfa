import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { productCategoriesController } from '../controllers/productCategories.controller';
import { createProductCategoriesValidation } from '../validations/productCategories.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-categories',
  authenticateToken,
  createProductCategoriesValidation,
  validate,
  productCategoriesController.createProductCategories
);

router.get(
  '/product-categories',
  authenticateToken,
  productCategoriesController.getAllProductCategories
);

router.put(
  '/product-categories/:id',
  authenticateToken,
  productCategoriesController.updateProductCategories
);
router.get(
  '/product-categories/:id',
  authenticateToken,
  productCategoriesController.getProductCategoriesById
);

router.delete(
  '/product-categories/:id',
  authenticateToken,
  productCategoriesController.deleteProductCategories
);

export default router;
