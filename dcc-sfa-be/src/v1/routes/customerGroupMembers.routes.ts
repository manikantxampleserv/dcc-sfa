import { Router } from 'express';
import { customerGroupMemberController } from '../controllers/customerGroupMember.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createCustomerGroupMemberValidation,
  validate,
  customerGroupMemberController.createCustomerGroupMember
);
router.get(
  '/customer-group-member',
  authenticateToken,
  customerGroupMemberController.getAllCustomerGroupMember
);
router.get(
  '/customer-group-member/:id',
  authenticateToken,
  customerGroupMemberController.getCustomerGroupMemberById
);
router.put(
  '/customer-group-member/:id',
  authenticateToken,
  auditUpdate('customer_group_members'),
  customerGroupMemberController.updateCustomerGroupMember
);
router.delete(
  '/customer-group-member/:id',
  authenticateToken,
  auditDelete('customer_group_members'),
  customerGroupMemberController.deleteCustomerGroupMember
);

export default router;
