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
import { customerComplaintsController } from '../controllers/customerComplaints.controller';

const router = Router();

router.post(
  '/customer-complaints',
  authenticateToken,
  auditCreate('customerComplaints'),
<<<<<<< HEAD
=======
  requirePermission([{ module: 'customer-complaint', action: 'create' }]),
  createCustomerComplaintsValidation,
  validate,
>>>>>>> 53d5d69d12fb083c8349e5a336abbd33ebe803d9
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
