import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { ordersController } from '../controllers/orders.controller';
import { validate } from '../../middlewares/validation.middleware';
import { createOrderValidation } from '../validations/orders.validation';

const router = Router();

router.post(
  '/orders',
  authenticateToken,
  createOrderValidation,
  validate,
  ordersController.createOrders
);

router.get('/orders/:id', authenticateToken, ordersController.getOrdersById);

router.get('/orders', authenticateToken, ordersController.getAllOrders);

router.put('/orders/:id', authenticateToken, ordersController.updateOrders);

router.delete('/orders/:id', authenticateToken, ordersController.deleteOrders);

export default router;
