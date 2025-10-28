import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { customerDocumentsController } from '../controllers/customerDocuments.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/customer-documents',
  upload.single('file'),
  authenticateToken,
  auditCreate('customer_documents'),
  customerDocumentsController.createCustomerDocuments
);

router.get(
  '/customer-documents/:id',
  authenticateToken,
  customerDocumentsController.getCustomerDocumentsById
);
router.get(
  '/customer-documents',
  authenticateToken,
  customerDocumentsController.getAllCustomerDocuments
);

router.put(
  '/customer-documents/:id',
  upload.single('file'),
  authenticateToken,
  auditUpdate('customer_documents'),
  customerDocumentsController.updateCustomerDocuments
);

router.delete(
  '/customer-documents/:id',
  authenticateToken,
  auditDelete('customer_documents'),
  customerDocumentsController.deleteCustomerDocuments
);

export default router;
