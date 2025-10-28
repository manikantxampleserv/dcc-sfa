import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/customers',
  authenticateToken,
  auditCreate('customers'),
  customerController.createCustomers
);
router.get('/customers', authenticateToken, customerController.getAllCustomers);
router.get(
  '/customers/:id',
  authenticateToken,
  customerController.getCustomersById
);
router.put(
  '/customers/:id',
  authenticateToken,
  auditUpdate('customers'),
  customerController.updateCustomers
);
router.delete(
  '/customers/:id',
  authenticateToken,
  auditDelete('customers'),
  customerController.deleteCustomers
);

export default router;
