import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { productSubCategoriesController } from '../controllers/productSubCategories.controller';
import { createProductSubCategoriesValidation } from '../validations/productSubCategories.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-sub-categories',
  authenticateToken,
  auditCreate('product_sub_categories'),
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
  auditUpdate('product_sub_categories'),
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
  auditDelete('product_sub_categories'),
  productSubCategoriesController.deleteProductSubCategories
);

export default router;
