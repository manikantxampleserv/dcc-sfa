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

// router.post(
//   '/customers/bulk-upsert',
//   authenticateToken,
//   auditCreate('customers'),
//   requirePermission([{ module: 'outlet', action: 'create' }]),
//   customerController.bulkUpsertCustomers
// );

router.post(
  '/customers/bulk-upsert',
  authenticateToken,
  upload.fields([
    { name: 'customer_images', maxCount: 50 }, // Multiple images per customer
    { name: 'profile_pics', maxCount: 10 }, // One profile pic per customer
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

export default router;
