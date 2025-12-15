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
import { productWebOrdersController } from '../controllers/productWebOrders.controller';
import { createProductWebOrderValidation } from '../validations/productWebOrders.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/product-web-orders',
  authenticateToken,
  auditCreate('product_web_order'),
  requirePermission([{ module: 'product-web-order', action: 'create' }]),
  createProductWebOrderValidation,
  validate,
  productWebOrdersController.createProductWebOrder
);

router.get(
  '/product-web-orders/:id',
  authenticateToken,
  requirePermission([{ module: 'product-web-order', action: 'read' }]),
  validate,
  productWebOrdersController.getProductWebOrderById
);
router.get(
  '/product-web-orders',
  authenticateToken,
  requirePermission([{ module: 'product-web-order', action: 'read' }]),
  productWebOrdersController.getProductWebOrders
);

router.put(
  '/product-web-orders/:id',
  authenticateToken,
  auditUpdate('product_web_order'),
  requirePermission([{ module: 'product-web-order', action: 'update' }]),
  productWebOrdersController.updateProductWebOrder
);

router.delete(
  '/product-web-orders/:id',
  authenticateToken,
  auditDelete('product_web_order'),
  requirePermission([{ module: 'product-web-order', action: 'delete' }]),
  productWebOrdersController.deleteProductWebOrder
);

router.get(
  '/product-web-orders-dropdown',
  authenticateToken,
  productWebOrdersController.getProductWebOrdersDropdown
);

export default router;
