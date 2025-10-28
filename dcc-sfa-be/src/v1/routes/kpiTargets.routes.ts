import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { kpiTargetsController } from '../controllers/kpiTargets.controller';
import {
  createKpiTargetValidation,
  updateKpiTargetValidation,
} from '../validations/kpiTargets.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

// Create KPI Target
router.post(
  '/kpi-targets',
  authenticateToken,
  auditCreate('kpi_targets'),
  createKpiTargetValidation,
  validate,
  kpiTargetsController.createKpiTarget
);

// Get all KPI Targets with pagination and filters
router.get(
  '/kpi-targets',
  authenticateToken,
  kpiTargetsController.getAllKpiTargets
);

// Get KPI Target by ID
router.get(
  '/kpi-targets/:id',
  authenticateToken,
  kpiTargetsController.getKpiTargetById
);

// Update KPI Target
router.put(
  '/kpi-targets/:id',
  authenticateToken,
  auditUpdate('kpi_targets'),
  updateKpiTargetValidation,
  validate,
  kpiTargetsController.updateKpiTarget
);

// Delete KPI Target (soft delete)
router.delete(
  '/kpi-targets/:id',
  authenticateToken,
  auditDelete('kpi_targets'),
  kpiTargetsController.deleteKpiTarget
);

export default router;
