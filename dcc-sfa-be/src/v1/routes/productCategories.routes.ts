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
import { productCategoriesController } from '../controllers/productCategories.controller';
import { createProductCategoriesValidation } from '../validations/productCategories.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-categories',
  authenticateToken,
  auditCreate('product_categories'),
  requirePermission([{ module: 'product-category', action: 'create' }]),
  createProductCategoriesValidation,
  validate,
  productCategoriesController.createProductCategories
);

router.get(
  '/product-categories',
  authenticateToken,
  requirePermission([{ module: 'product-category', action: 'read' }]),
  productCategoriesController.getAllProductCategories
);

router.put(
  '/product-categories/:id',
  authenticateToken,
  auditUpdate('product_categories'),
  requirePermission([{ module: 'product-category', action: 'update' }]),
  productCategoriesController.updateProductCategories
);
router.get(
  '/product-categories/:id',
  authenticateToken,
  requirePermission([{ module: 'product-category', action: 'read' }]),
  productCategoriesController.getProductCategoriesById
);

router.delete(
  '/product-categories/:id',
  authenticateToken,
  auditDelete('product_categories'),
  requirePermission([{ module: 'product-category', action: 'delete' }]),
  productCategoriesController.deleteProductCategories
);

router.get(
  '/product-categories-dropdown',
  authenticateToken,
  productCategoriesController.getProductCategoriesDropdown
);

export default router;
