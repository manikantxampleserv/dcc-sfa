import express from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/payments', authenticateToken, paymentsController.createPayment);
router.get('/payments', authenticateToken, paymentsController.getPayments);
router.get(
  '/payments/:id',
  authenticateToken,
  paymentsController.getPaymentById
);
router.put(
  '/payments/:id',
  authenticateToken,
  paymentsController.updatePayment
);
router.delete(
  '/payments/:id',
  authenticateToken,
  paymentsController.deletePayment
);

export default router;
