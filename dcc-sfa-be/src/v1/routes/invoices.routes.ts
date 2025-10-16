import express from 'express';
import { invoicesController } from '../controllers/invoices.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createInvoiceValidation,
  invoicesController.createInvoice
);
router.get('/invoices', invoicesController.getInvoices);
router.get('/invoices/:id', invoicesController.getInvoiceById);
router.put(
  '/invoices/:id',
  updateInvoiceValidation,
  invoicesController.updateInvoice
);
router.delete('/invoices/:id', invoicesController.deleteInvoice);

// Invoice Payment Lines Routes
router.post(
  '/invoices/:invoiceId/payment-lines',
  invoicesController.createInvoicePaymentLine
);
router.get(
  '/invoices/:invoiceId/payment-lines',
  invoicesController.getInvoicePaymentLines
);
router.put(
  '/invoices/:invoiceId/payment-lines/:lineId',
  invoicesController.updateInvoicePaymentLine
);
router.delete(
  '/invoices/:invoiceId/payment-lines/:lineId',
  invoicesController.deleteInvoicePaymentLine
);
router.put(
  '/invoices/:invoiceId/payment-lines',
  invoicesController.bulkUpdateInvoicePaymentLines
);

// Invoice Items Routes
router.post('/invoices/:invoiceId/items', invoicesController.createInvoiceItem);
router.get('/invoices/:invoiceId/items', invoicesController.getInvoiceItems);
router.put(
  '/invoices/:invoiceId/items/:itemId',
  invoicesController.updateInvoiceItem
);
router.delete(
  '/invoices/:invoiceId/items/:itemId',
  invoicesController.deleteInvoiceItem
);
router.put(
  '/invoices/:invoiceId/items',
  invoicesController.bulkUpdateInvoiceItems
);

export default router;
