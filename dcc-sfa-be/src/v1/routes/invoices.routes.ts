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

export default router;
