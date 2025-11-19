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
import { ordersController } from '../controllers/orders.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createOrderValidation } from '../validations/orders.validation';

const router = Router();

router.post(
  '/orders',
  authenticateToken,
  auditCreate('orders'),
  requirePermission([{ module: 'order', action: 'create' }]),
  createOrderValidation,
  validate,
  ordersController.createOrUpdateOrder
);

router.get(
  '/orders/:id',
  authenticateToken,
  requirePermission([{ module: 'order', action: 'read' }]),
  ordersController.getOrdersById
);

router.get(
  '/orders',
  authenticateToken,
  requirePermission([{ module: 'order', action: 'read' }]),
  ordersController.getAllOrders
);

router.put(
  '/orders/:id',
  authenticateToken,
  auditUpdate('orders'),
  requirePermission([{ module: 'order', action: 'update' }]),
  ordersController.updateOrders
);

router.delete(
  '/orders/:id',
  authenticateToken,
  auditDelete('orders'),
  requirePermission([{ module: 'order', action: 'delete' }]),
  ordersController.deleteOrders
);

router.get(
  '/orders/order-items/:id',
  authenticateToken,
  requirePermission([{ module: 'order', action: 'read' }]),
  ordersController.getOrdersOrderItemsByOrderId
);

export default router;
