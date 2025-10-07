import { Router } from 'express';
import { customerGroupsController } from '../controllers/customerGroups.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { createCustomerGroupsValidation } from '../validations/customerGroups.validation';
import { validate } from '../../middlewares/validation.middleware';
const router = Router();

router.post(
  '/customer-groups',
  authenticateToken,
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
  customerGroupsController.updateCustomerGroups
);
router.delete(
  '/customer-groups/:id',
  authenticateToken,
  customerGroupsController.deleteCustomerGroups
);

export default router;
