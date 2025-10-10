import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { productSubCategoriesController } from '../controllers/productSubCategories.controller';
import { createProductSubCategoriesValidation } from '../validations/productSubCategories.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-sub-categories',
  authenticateToken,
  createProductSubCategoriesValidation,
  validate,
  productSubCategoriesController.createProductSubCategories
);

router.get(
  '/product-sub-categories',
  authenticateToken,
  productSubCategoriesController.getAllProductSubCategories
);

router.put(
  '/product-sub-categories/:id',
  authenticateToken,
  productSubCategoriesController.updateProductSubCategories
);
router.get(
  '/product-sub-categories/:id',
  authenticateToken,
  productSubCategoriesController.getProductSubCategoriesById
);

router.delete(
  '/product-sub-categories/:id',
  authenticateToken,
  productSubCategoriesController.deleteProductSubCategories
);

export default router;
