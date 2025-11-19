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
import { coolerInspectionsController } from '../controllers/coolerInspections.controller';
import { createCoolerInspectionValidation } from '../validations/coolerInspections.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/cooler-inspections',
  authenticateToken,
  auditCreate('cooler_inspections'),
  requirePermission([{ module: 'inspection', action: 'create' }]),
  createCoolerInspectionValidation,
  validate,
  coolerInspectionsController.createCoolerInspection
);

router.get(
  '/cooler-inspections/status-options',
  authenticateToken,
  requirePermission([{ module: 'inspection', action: 'read' }]),
  coolerInspectionsController.getCoolerInspectionStatusOptions
);

router.get(
  '/cooler-inspections/:id',
  authenticateToken,
  requirePermission([{ module: 'inspection', action: 'read' }]),
  validate,
  coolerInspectionsController.getCoolerInspectionById
);

router.get(
  '/cooler-inspections',
  authenticateToken,
  requirePermission([{ module: 'inspection', action: 'read' }]),
  coolerInspectionsController.getCoolerInspections
);

router.put(
  '/cooler-inspections/:id',
  authenticateToken,
  auditUpdate('cooler_inspections'),
  requirePermission([{ module: 'inspection', action: 'update' }]),
  coolerInspectionsController.updateCoolerInspection
);

router.patch(
  '/cooler-inspections/:id/status',
  authenticateToken,
  requirePermission([{ module: 'inspection', action: 'update' }]),
  coolerInspectionsController.updateCoolerInspectionStatus
);

router.delete(
  '/cooler-inspections/:id',
  authenticateToken,
  auditDelete('cooler_inspections'),
  requirePermission([{ module: 'inspection', action: 'delete' }]),
  coolerInspectionsController.deleteCoolerInspection
);

export default router;
