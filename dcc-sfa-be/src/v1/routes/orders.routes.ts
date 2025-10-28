import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createOrderValidation,
  validate,
  ordersController.createOrUpdateOrder
);

router.get('/orders/:id', authenticateToken, ordersController.getOrdersById);

router.get('/orders', authenticateToken, ordersController.getAllOrders);

router.put(
  '/orders/:id',
  authenticateToken,
  auditUpdate('orders'),
  ordersController.updateOrders
);

router.delete(
  '/orders/:id',
  authenticateToken,
  auditDelete('orders'),
  ordersController.deleteOrders
);

export default router;
