import { Router } from 'express';
import { customerController } from './controllers/customer.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/customers',
  authenticateToken,
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
  customerController.updateCustomers
);
router.delete(
  '/customers/:id',
  authenticateToken,
  customerController.deleteCustomers
);

export default router;
