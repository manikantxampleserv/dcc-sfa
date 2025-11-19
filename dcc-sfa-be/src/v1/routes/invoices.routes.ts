import express from 'express';
import { invoicesController } from '../controllers/invoices.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import {
  createInvoiceValidation,
  updateInvoiceValidation,
} from '../validations/invoice.validation';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Invoice CRUD operations
router.post(
  '/invoices',
  auditCreate('invoices'),
  requirePermission([{ module: 'invoice', action: 'create' }]),
  createInvoiceValidation,
  invoicesController.createInvoice
);
router.get(
  '/invoices',
  requirePermission([{ module: 'invoice', action: 'read' }]),
  invoicesController.getInvoices
);
router.get(
  '/invoices/:id',
  requirePermission([{ module: 'invoice', action: 'read' }]),
  invoicesController.getInvoiceById
);
router.put(
  '/invoices/:id',
  auditUpdate('invoices'),
  requirePermission([{ module: 'invoice', action: 'update' }]),
  updateInvoiceValidation,
  invoicesController.updateInvoice
);
router.delete(
  '/invoices/:id',
  auditDelete('invoices'),
  requirePermission([{ module: 'invoice', action: 'delete' }]),
  invoicesController.deleteInvoice
);

// Invoice Payment Lines Routes
router.post(
  '/invoices/:invoiceId/payment-lines',
  auditCreate('invoice_payment_lines'),
  requirePermission([{ module: 'invoice', action: 'create' }]),
  invoicesController.createInvoicePaymentLine
);
router.get(
  '/invoices/:invoiceId/payment-lines',
  requirePermission([{ module: 'invoice', action: 'read' }]),
  invoicesController.getInvoicePaymentLines
);
router.put(
  '/invoices/:invoiceId/payment-lines/:lineId',
  auditUpdate('invoice_payment_lines'),
  requirePermission([{ module: 'invoice', action: 'update' }]),
  invoicesController.updateInvoicePaymentLine
);
router.delete(
  '/invoices/:invoiceId/payment-lines/:lineId',
  auditDelete('invoice_payment_lines'),
  requirePermission([{ module: 'invoice', action: 'delete' }]),
  invoicesController.deleteInvoicePaymentLine
);
router.put(
  '/invoices/:invoiceId/payment-lines',
  auditUpdate('invoice_payment_lines'),
  requirePermission([{ module: 'invoice', action: 'update' }]),
  invoicesController.bulkUpdateInvoicePaymentLines
);

// Invoice Items Routes
router.post(
  '/invoices/:invoiceId/items',
  auditCreate('invoice_items'),
  requirePermission([{ module: 'invoice', action: 'create' }]),
  invoicesController.createInvoiceItem
);
router.get(
  '/invoices/:invoiceId/items',
  requirePermission([{ module: 'invoice', action: 'read' }]),
  invoicesController.getInvoiceItems
);
router.put(
  '/invoices/:invoiceId/items/:itemId',
  auditUpdate('invoice_items'),
  requirePermission([{ module: 'invoice', action: 'update' }]),
  invoicesController.updateInvoiceItem
);
router.delete(
  '/invoices/:invoiceId/items/:itemId',
  auditDelete('invoice_items'),
  requirePermission([{ module: 'invoice', action: 'delete' }]),
  invoicesController.deleteInvoiceItem
);
router.put(
  '/invoices/:invoiceId/items',
  auditUpdate('invoice_items'),
  requirePermission([{ module: 'invoice', action: 'update' }]),
  invoicesController.bulkUpdateInvoiceItems
);

export default router;
