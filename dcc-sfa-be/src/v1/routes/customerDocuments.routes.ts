import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { customerDocumentsController } from '../controllers/customerDocuments.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/customer-documents',
  upload.single('file'),
  authenticateToken,
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
  customerDocumentsController.updateCustomerDocuments
);

router.delete(
  '/customer-documents/:id',
  authenticateToken,
  customerDocumentsController.deleteCustomerDocuments
);

export default router;
