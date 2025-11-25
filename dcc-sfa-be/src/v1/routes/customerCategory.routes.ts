import express from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { customerCategoryController } from '../controllers/customerCategory.controller';
import { auditCreate, auditDelete } from '../../middlewares/audit.middleware';

const router = express.Router();

router.post(
  '/customer-category/bulk',
  authenticateToken,
  auditCreate('customer_category'),
  requirePermission([{ module: 'customer-category', action: 'create' }]),
  customerCategoryController.bulkCustomerCategory
);

router.get(
  '/customer-category',
  authenticateToken,
  requirePermission([{ module: 'customer-category', action: 'read' }]),
  customerCategoryController.getAllCustomerCategory
);

router.get(
  '/customer-category/:id',
  authenticateToken,
  requirePermission([{ module: 'customer-category', action: 'read' }]),
  customerCategoryController.getCustomerCategoryById
);

router.delete(
  '/customer-category/:id',
  authenticateToken,
  auditDelete('customer_category'),
  requirePermission([{ module: 'customer-category', action: 'delete' }]),
  customerCategoryController.deleteCustomerCategory
);

export default router;
