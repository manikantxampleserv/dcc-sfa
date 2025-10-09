import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { orderItemsController } from '../controllers/orderItems.controller';

const router = Router();

router.post(
  '/order-items',
  authenticateToken,
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
  orderItemsController.updateOrderItems
);

router.delete(
  '/order-items/:id',
  authenticateToken,
  orderItemsController.deleteOrderItems
);

export default router;
