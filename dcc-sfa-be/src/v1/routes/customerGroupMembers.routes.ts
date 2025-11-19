import { Router } from 'express';
import { customerGroupMemberController } from '../controllers/customerGroupMember.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createCustomerGroupMemberValidation } from '../validations/customerGroupMember.validation';
import { validate } from '../../middlewares/validation.middleware';
const router = Router();

router.post(
  '/customer-group-member',
  authenticateToken,
  auditCreate('customer_group_members'),
  requirePermission([{ module: 'outlet-group', action: 'create' }]),
  createCustomerGroupMemberValidation,
  validate,
  customerGroupMemberController.createCustomerGroupMember
);
router.get(
  '/customer-group-member',
  authenticateToken,
  requirePermission([{ module: 'outlet-group', action: 'read' }]),
  customerGroupMemberController.getAllCustomerGroupMember
);
router.get(
  '/customer-group-member/:id',
  authenticateToken,
  requirePermission([{ module: 'outlet-group', action: 'read' }]),
  customerGroupMemberController.getCustomerGroupMemberById
);
router.put(
  '/customer-group-member/:id',
  authenticateToken,
  auditUpdate('customer_group_members'),
  requirePermission([{ module: 'outlet-group', action: 'update' }]),
  customerGroupMemberController.updateCustomerGroupMember
);
router.delete(
  '/customer-group-member/:id',
  authenticateToken,
  auditDelete('customer_group_members'),
  requirePermission([{ module: 'outlet-group', action: 'delete' }]),
  customerGroupMemberController.deleteCustomerGroupMember
);

export default router;
