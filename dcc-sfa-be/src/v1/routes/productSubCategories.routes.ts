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
import { productSubCategoriesController } from '../controllers/productSubCategories.controller';
import { createProductSubCategoriesValidation } from '../validations/productSubCategories.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-sub-categories',
  authenticateToken,
  auditCreate('product_sub_categories'),
  requirePermission([{ module: 'product-sub-category', action: 'create' }]),
  createProductSubCategoriesValidation,
  validate,
  productSubCategoriesController.createProductSubCategories
);

router.get(
  '/product-sub-categories',
  authenticateToken,
  requirePermission([{ module: 'product-sub-category', action: 'read' }]),
  productSubCategoriesController.getAllProductSubCategories
);

router.put(
  '/product-sub-categories/:id',
  authenticateToken,
  auditUpdate('product_sub_categories'),
  requirePermission([{ module: 'product-sub-category', action: 'update' }]),
  productSubCategoriesController.updateProductSubCategories
);
router.get(
  '/product-sub-categories/:id',
  authenticateToken,
  requirePermission([{ module: 'product-sub-category', action: 'read' }]),
  productSubCategoriesController.getProductSubCategoriesById
);

router.delete(
  '/product-sub-categories/:id',
  authenticateToken,
  auditDelete('product_sub_categories'),
  requirePermission([{ module: 'product-sub-category', action: 'delete' }]),
  productSubCategoriesController.deleteProductSubCategories
);

export default router;
