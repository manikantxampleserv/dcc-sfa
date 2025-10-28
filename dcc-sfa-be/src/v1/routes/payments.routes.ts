import express from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';

const router = express.Router();

router.post(
  '/payments',
  authenticateToken,
  auditCreate('payments'),
  paymentsController.createPayment
);
router.get('/payments', authenticateToken, paymentsController.getPayments);
router.get(
  '/payments/:id',
  authenticateToken,
  paymentsController.getPaymentById
);
router.put(
  '/payments/:id',
  authenticateToken,
  auditUpdate('payments'),
  paymentsController.updatePayment
);
router.delete(
  '/payments/:id',
  authenticateToken,
  auditDelete('payments'),
  paymentsController.deletePayment
);

// Payment Lines Routes
router.post(
  '/payments/:paymentId/lines',
  authenticateToken,
  auditCreate('payment_lines'),
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
  auditDelete('payment_lines'),
  paymentsController.deletePaymentLine
);

// Payment Refunds Routes
router.post(
  '/payments/:paymentId/refunds',
  authenticateToken,
  auditCreate('payment_refunds'),
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
  auditUpdate('payment_refunds'),
  paymentsController.updatePaymentRefund
);
router.delete(
  '/payments/:paymentId/refunds/:refundId',
  authenticateToken,
  auditDelete('payment_refunds'),
  paymentsController.deletePaymentRefund
);

export default router;
