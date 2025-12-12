import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/customers',
  authenticateToken,
  auditCreate('customers'),
  requirePermission([{ module: 'outlet', action: 'create' }]),
  customerController.createCustomers
);
router.get(
  '/customers',
  authenticateToken,
  requirePermission([{ module: 'outlet', action: 'read' }]),
  customerController.getAllCustomers
);
router.get(
  '/customers/:id',
  authenticateToken,
  requirePermission([{ module: 'outlet', action: 'read' }]),
  customerController.getCustomersById
);
router.put(
  '/customers/:id',
  authenticateToken,
  auditUpdate('customers'),
  requirePermission([{ module: 'outlet', action: 'update' }]),
  customerController.updateCustomers
);
router.delete(
  '/customers/:id',
  authenticateToken,
  auditDelete('customers'),
  requirePermission([{ module: 'outlet', action: 'delete' }]),
  customerController.deleteCustomers
);

router.post(
  '/customers-upload/:id/images',
  upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'outlet_images', maxCount: 10 },
  ]),
  customerController.uploadCustomerImages
);
router.post(
  '/customers/bulk-upsert',
  authenticateToken,
  upload.fields([
    { name: 'profile_picture', maxCount: 10 },
    { name: 'outlet_images', maxCount: 10 },
    { name: 'profile_pics', maxCount: 10 },
    { name: 'customer_images', maxCount: 10 },
  ]),
  auditCreate('customers'),
  requirePermission([{ module: 'outlet', action: 'create' }]),
  customerController.bulkUpsertCustomers
);

router.get(
  '/customers-dropdown',
  authenticateToken,
  customerController.getCustomersDropdown
);

router.get(
  '/customers/:id/relations',
  authenticateToken,
  requirePermission([{ module: 'outlet', action: 'read' }]),
  customerController.getCustomerRelations
);

export default router;
