import { Router } from 'express';
import { customerGroupsController } from '../controllers/customerGroups.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
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
  requirePermission([{ module: 'outlet-group', action: 'create' }]),
  createCustomerGroupsValidation,
  validate,
  customerGroupsController.createCustomerGroups
);
router.get(
  '/customer-groups',
  authenticateToken,
  requirePermission([{ module: 'outlet-group', action: 'read' }]),
  customerGroupsController.getAllCustomerGroups
);
router.get(
  '/customer-groups/:id',
  authenticateToken,
  requirePermission([{ module: 'outlet-group', action: 'read' }]),
  customerGroupsController.getCustomerGroupsById
);
router.put(
  '/customer-groups/:id',
  authenticateToken,
  auditUpdate('customer_groups'),
  requirePermission([{ module: 'outlet-group', action: 'update' }]),
  customerGroupsController.updateCustomerGroups
);
router.delete(
  '/customer-groups/:id',
  authenticateToken,
  auditDelete('customer_groups'),
  requirePermission([{ module: 'outlet-group', action: 'delete' }]),
  customerGroupsController.deleteCustomerGroups
);

export default router;
