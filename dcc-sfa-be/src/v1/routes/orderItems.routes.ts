import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  orderItemsController.createOrderItems
);

router.get(
  '/order-items/:id',
  authenticateToken,
  orderItemsController.getOrderItemsById
);

router.get(
  '/order-items',
  authenticateToken,
  orderItemsController.getAllOrderItems
);

router.put(
  '/order-items/:id',
  authenticateToken,
  auditUpdate('order_items'),
  orderItemsController.updateOrderItems
);

router.delete(
  '/order-items/:id',
  authenticateToken,
  auditDelete('order_items'),
  orderItemsController.deleteOrderItems
);

export default router;
