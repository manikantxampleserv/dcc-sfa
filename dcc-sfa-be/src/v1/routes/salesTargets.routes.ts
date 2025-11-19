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
import { salesTargetsController } from '../controllers/salesTargets.controller';
import {
  createSalesTargetValidation,
  updateSalesTargetValidation,
} from '../validations/salesTargets.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

// Create Sales Target
router.post(
  '/sales-targets',
  authenticateToken,
  auditCreate('sales_targets'),
  requirePermission([{ module: 'sales-target', action: 'create' }]),
  createSalesTargetValidation,
  validate,
  salesTargetsController.createSalesTarget
);

// Get all Sales Targets with pagination and filters
router.get(
  '/sales-targets',
  authenticateToken,
  requirePermission([{ module: 'sales-target', action: 'read' }]),
  salesTargetsController.getAllSalesTargets
);

// Get Sales Target by ID
router.get(
  '/sales-targets/:id',
  authenticateToken,
  requirePermission([{ module: 'sales-target', action: 'read' }]),
  salesTargetsController.getSalesTargetById
);

// Update Sales Target
router.put(
  '/sales-targets/:id',
  authenticateToken,
  auditUpdate('sales_targets'),
  requirePermission([{ module: 'sales-target', action: 'update' }]),
  updateSalesTargetValidation,
  validate,
  salesTargetsController.updateSalesTarget
);

// Delete Sales Target (soft delete)
router.delete(
  '/sales-targets/:id',
  authenticateToken,
  auditDelete('sales_targets'),
  requirePermission([{ module: 'sales-target', action: 'delete' }]),
  salesTargetsController.deleteSalesTarget
);

export default router;
