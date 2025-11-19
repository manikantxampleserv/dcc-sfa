import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createCustomerComplaintsValidation } from '../validations/customerComplaints.validation';
import { customerComplaintsController } from '../controllers/customerComplaints.controller';

const router = Router();

router.post(
  '/customer-complaints',
  authenticateToken,
  auditCreate('customerComplaints'),
  requirePermission([{ module: 'customer-complaint', action: 'create' }]),
  createCustomerComplaintsValidation,
  validate,
  customerComplaintsController.createOrUpdateCustomerComplaints
);

router.get(
  '/customer-complaints/:id',
  authenticateToken,
  requirePermission([{ module: 'customer-complaint', action: 'read' }]),
  customerComplaintsController.getCustomerComplaintsById
);

router.get(
  '/customer-complaints',
  authenticateToken,
  requirePermission([{ module: 'customer-complaint', action: 'read' }]),
  customerComplaintsController.getAllCustomerComplaints
);

// router.put(
//   '/customer-complaints/:id',
//   authenticateToken,
//   auditUpdate('customerComplaints'),
//   customerComplaintsController.updateCustomerComplaints
// );

router.delete(
  '/customer-complaints/:id',
  authenticateToken,
  auditDelete('customerComplaints'),
  requirePermission([{ module: 'customer-complaint', action: 'delete' }]),
  customerComplaintsController.deleteCustomerComplaints
);

export default router;
