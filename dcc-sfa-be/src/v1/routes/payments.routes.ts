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

// Payment Lines Routes
router.post(
  '/payments/:paymentId/lines',
  authenticateToken,
  paymentsController.createPaymentLine
);
router.get(
  '/payments/:paymentId/lines',
  authenticateToken,
  paymentsController.getPaymentLines
);
router.delete(
  '/payments/:paymentId/lines/:lineId',
  authenticateToken,
  paymentsController.deletePaymentLine
);

// Payment Refunds Routes
router.post(
  '/payments/:paymentId/refunds',
  authenticateToken,
  paymentsController.createPaymentRefund
);
router.get(
  '/payments/:paymentId/refunds',
  authenticateToken,
  paymentsController.getPaymentRefunds
);
router.put(
  '/payments/:paymentId/refunds/:refundId',
  authenticateToken,
  paymentsController.updatePaymentRefund
);
router.delete(
  '/payments/:paymentId/refunds/:refundId',
  authenticateToken,
  paymentsController.deletePaymentRefund
);

export default router;
