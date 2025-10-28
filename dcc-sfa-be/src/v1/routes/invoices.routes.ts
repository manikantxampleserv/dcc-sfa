import express from 'express';
import { invoicesController } from '../controllers/invoices.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createInvoiceValidation,
  invoicesController.createInvoice
);
router.get('/invoices', invoicesController.getInvoices);
router.get('/invoices/:id', invoicesController.getInvoiceById);
router.put(
  '/invoices/:id',
  auditUpdate('invoices'),
  updateInvoiceValidation,
  invoicesController.updateInvoice
);
router.delete(
  '/invoices/:id',
  auditDelete('invoices'),
  invoicesController.deleteInvoice
);

// Invoice Payment Lines Routes
router.post(
  '/invoices/:invoiceId/payment-lines',
  auditCreate('invoice_payment_lines'),
  invoicesController.createInvoicePaymentLine
);
router.get(
  '/invoices/:invoiceId/payment-lines',
  invoicesController.getInvoicePaymentLines
);
router.put(
  '/invoices/:invoiceId/payment-lines/:lineId',
  auditUpdate('invoice_payment_lines'),
  invoicesController.updateInvoicePaymentLine
);
router.delete(
  '/invoices/:invoiceId/payment-lines/:lineId',
  auditDelete('invoice_payment_lines'),
  invoicesController.deleteInvoicePaymentLine
);
router.put(
  '/invoices/:invoiceId/payment-lines',
  auditUpdate('invoice_payment_lines'),
  invoicesController.bulkUpdateInvoicePaymentLines
);

// Invoice Items Routes
router.post(
  '/invoices/:invoiceId/items',
  auditCreate('invoice_items'),
  invoicesController.createInvoiceItem
);
router.get('/invoices/:invoiceId/items', invoicesController.getInvoiceItems);
router.put(
  '/invoices/:invoiceId/items/:itemId',
  auditUpdate('invoice_items'),
  invoicesController.updateInvoiceItem
);
router.delete(
  '/invoices/:invoiceId/items/:itemId',
  auditDelete('invoice_items'),
  invoicesController.deleteInvoiceItem
);
router.put(
  '/invoices/:invoiceId/items',
  auditUpdate('invoice_items'),
  invoicesController.bulkUpdateInvoiceItems
);

export default router;
