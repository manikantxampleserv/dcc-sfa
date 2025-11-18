import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createCustomerComplaintsValidation,
  validate,
  customerComplaintsController.createOrUpdateCustomerComplaints
);

router.get(
  '/customer-complaints/:id',
  authenticateToken,
  customerComplaintsController.getCustomerComplaintsById
);

router.get(
  '/customer-complaints',
  authenticateToken,
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
  customerComplaintsController.deleteCustomerComplaints
);

export default router;
