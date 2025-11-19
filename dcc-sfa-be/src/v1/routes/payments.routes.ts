import express from 'express';
import { paymentsController } from '../controllers/payments.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
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
  requirePermission([{ module: 'payment', action: 'create' }]),
  paymentsController.createPayment
);
router.get(
  '/payments',
  authenticateToken,
  requirePermission([{ module: 'payment', action: 'read' }]),
  paymentsController.getPayments
);
router.get(
  '/payments/:id',
  authenticateToken,
  requirePermission([{ module: 'payment', action: 'read' }]),
  paymentsController.getPaymentById
);
router.put(
  '/payments/:id',
  authenticateToken,
  auditUpdate('payments'),
  requirePermission([{ module: 'payment', action: 'update' }]),
  paymentsController.updatePayment
);
router.delete(
  '/payments/:id',
  authenticateToken,
  auditDelete('payments'),
  requirePermission([{ module: 'payment', action: 'delete' }]),
  paymentsController.deletePayment
);

// Payment Lines Routes
router.post(
  '/payments/:paymentId/lines',
  authenticateToken,
  auditCreate('payment_lines'),
  requirePermission([{ module: 'payment', action: 'create' }]),
  paymentsController.createPaymentLine
);
router.get(
  '/payments/:paymentId/lines',
  authenticateToken,
  requirePermission([{ module: 'payment', action: 'read' }]),
  paymentsController.getPaymentLines
);
router.delete(
  '/payments/:paymentId/lines/:lineId',
  authenticateToken,
  auditDelete('payment_lines'),
  requirePermission([{ module: 'payment', action: 'delete' }]),
  paymentsController.deletePaymentLine
);

// Payment Refunds Routes
router.post(
  '/payments/:paymentId/refunds',
  authenticateToken,
  auditCreate('payment_refunds'),
  requirePermission([{ module: 'payment', action: 'create' }]),
  paymentsController.createPaymentRefund
);
router.get(
  '/payments/:paymentId/refunds',
  authenticateToken,
  requirePermission([{ module: 'payment', action: 'read' }]),
  paymentsController.getPaymentRefunds
);
router.put(
  '/payments/:paymentId/refunds/:refundId',
  authenticateToken,
  auditUpdate('payment_refunds'),
  requirePermission([{ module: 'payment', action: 'update' }]),
  paymentsController.updatePaymentRefund
);
router.delete(
  '/payments/:paymentId/refunds/:refundId',
  authenticateToken,
  auditDelete('payment_refunds'),
  requirePermission([{ module: 'payment', action: 'delete' }]),
  paymentsController.deletePaymentRefund
);

export default router;
