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
import { productFlavoursController } from '../controllers/productFlavours.controller';
import { createProductFlavourValidation } from '../validations/productFlavours.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-flavours',
  authenticateToken,
  auditCreate('product_flavours'),
  requirePermission([{ module: 'product-flavour', action: 'create' }]),
  createProductFlavourValidation,
  validate,
  productFlavoursController.createProductFlavour
);

router.get(
  '/product-flavours/:id',
  authenticateToken,
  requirePermission([{ module: 'product-flavour', action: 'read' }]),
  validate,
  productFlavoursController.getProductFlavourById
);
router.get(
  '/product-flavours',
  authenticateToken,
  requirePermission([{ module: 'product-flavour', action: 'read' }]),
  productFlavoursController.getProductFlavours
);

router.put(
  '/product-flavours/:id',
  authenticateToken,
  auditUpdate('product_flavours'),
  requirePermission([{ module: 'product-flavour', action: 'update' }]),
  productFlavoursController.updateProductFlavour
);

router.delete(
  '/product-flavours/:id',
  authenticateToken,
  auditDelete('product_flavours'),
  requirePermission([{ module: 'product-flavour', action: 'delete' }]),
  productFlavoursController.deleteProductFlavour
);

router.get(
  '/product-flavours-dropdown',
  authenticateToken,
  productFlavoursController.getProductFlavoursDropdown
);

export default router;
