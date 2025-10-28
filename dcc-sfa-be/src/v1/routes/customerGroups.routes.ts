import { Router } from 'express';
import { customerGroupsController } from '../controllers/customerGroups.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createCustomerGroupsValidation } from '../validations/customerGroups.validation';
import { validate } from '../../middlewares/validation.middleware';
const router = Router();

router.post(
  '/customer-groups',
  authenticateToken,
  auditCreate('customer_groups'),
  createCustomerGroupsValidation,
  validate,
  customerGroupsController.createCustomerGroups
);
router.get(
  '/customer-groups',
  authenticateToken,
  customerGroupsController.getAllCustomerGroups
);
router.get(
  '/customer-groups/:id',
  authenticateToken,
  customerGroupsController.getCustomerGroupsById
);
router.put(
  '/customer-groups/:id',
  authenticateToken,
  auditUpdate('customer_groups'),
  customerGroupsController.updateCustomerGroups
);
router.delete(
  '/customer-groups/:id',
  authenticateToken,
  auditDelete('customer_groups'),
  customerGroupsController.deleteCustomerGroups
);

export default router;
