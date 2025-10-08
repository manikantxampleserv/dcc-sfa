import { Router } from 'express';
import { customerGroupMemberController } from '../controllers/customerGroupMember.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { createCustomerGroupMemberValidation } from '../validations/customerGroupMember.validation';
import { validate } from '../../middlewares/validation.middleware';
const router = Router();

router.post(
  '/customer-group-member',
  authenticateToken,
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
  customerGroupMemberController.updateCustomerGroupMember
);
router.delete(
  '/customer-group-member/:id',
  authenticateToken,
  customerGroupMemberController.deleteCustomerGroupMember
);

export default router;
