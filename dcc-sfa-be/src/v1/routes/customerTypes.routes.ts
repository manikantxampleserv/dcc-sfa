import { Router } from 'express';
import { customerTypesController } from '../controllers/customerTypes.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/customer-types',
  authenticateToken,
  auditCreate('customer_type'),
  customerTypesController.createCustomerTypes
);
router.get(
  '/customer-types',
  authenticateToken,
  customerTypesController.getAllCustomerTypes
);

router.get(
  '/customer-types/:id',
  authenticateToken,
  customerTypesController.getCustomerTypesById
);
router.put(
  '/customer-types/:id',
  authenticateToken,
  auditUpdate('customer_type'),
  customerTypesController.updateCustomerTypes
);
router.delete(
  '/customer-types/:id',
  authenticateToken,
  auditDelete('customer_type'),
  customerTypesController.deleteCustomerTypes
);

export default router;
