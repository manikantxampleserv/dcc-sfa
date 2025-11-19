import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
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
  requirePermission([{ module: 'outlet', action: 'create' }]),
  customerDocumentsController.createCustomerDocuments
);

router.get(
  '/customer-documents/:id',
  authenticateToken,
  requirePermission([{ module: 'outlet', action: 'read' }]),
  customerDocumentsController.getCustomerDocumentsById
);
router.get(
  '/customer-documents',
  authenticateToken,
  requirePermission([{ module: 'outlet', action: 'read' }]),
  customerDocumentsController.getAllCustomerDocuments
);

router.put(
  '/customer-documents/:id',
  upload.single('file'),
  authenticateToken,
  auditUpdate('customer_documents'),
  requirePermission([{ module: 'outlet', action: 'update' }]),
  customerDocumentsController.updateCustomerDocuments
);

router.delete(
  '/customer-documents/:id',
  authenticateToken,
  auditDelete('customer_documents'),
  requirePermission([{ module: 'outlet', action: 'delete' }]),
  customerDocumentsController.deleteCustomerDocuments
);

export default router;
