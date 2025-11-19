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
import { orderItemsController } from '../controllers/orderItems.controller';

const router = Router();

router.post(
  '/order-items',
  authenticateToken,
  auditCreate('order_items'),
  requirePermission([{ module: 'order', action: 'create' }]),
  orderItemsController.createOrderItems
);

router.get(
  '/order-items/:id',
  authenticateToken,
  requirePermission([{ module: 'order', action: 'read' }]),
  orderItemsController.getOrderItemsById
);

router.get(
  '/order-items',
  authenticateToken,
  requirePermission([{ module: 'order', action: 'read' }]),
  orderItemsController.getAllOrderItems
);

router.put(
  '/order-items/:id',
  authenticateToken,
  auditUpdate('order_items'),
  requirePermission([{ module: 'order', action: 'update' }]),
  orderItemsController.updateOrderItems
);

router.delete(
  '/order-items/:id',
  authenticateToken,
  auditDelete('order_items'),
  requirePermission([{ module: 'order', action: 'delete' }]),
  orderItemsController.deleteOrderItems
);

export default router;
