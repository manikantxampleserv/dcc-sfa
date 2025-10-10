import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createSalesTargetValidation,
  validate,
  salesTargetsController.createSalesTarget
);

// Get all Sales Targets with pagination and filters
router.get(
  '/sales-targets',
  authenticateToken,
  salesTargetsController.getAllSalesTargets
);

// Get Sales Target by ID
router.get(
  '/sales-targets/:id',
  authenticateToken,
  salesTargetsController.getSalesTargetById
);

// Update Sales Target
router.put(
  '/sales-targets/:id',
  authenticateToken,
  updateSalesTargetValidation,
  validate,
  salesTargetsController.updateSalesTarget
);

// Delete Sales Target (soft delete)
router.delete(
  '/sales-targets/:id',
  authenticateToken,
  salesTargetsController.deleteSalesTarget
);

export default router;
