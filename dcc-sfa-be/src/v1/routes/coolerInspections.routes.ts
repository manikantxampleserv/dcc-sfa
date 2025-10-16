import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { coolerInspectionsController } from '../controllers/coolerInspections.controller';
import { createCoolerInspectionValidation } from '../validations/coolerInspections.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/cooler-inspections',
  authenticateToken,
  createCoolerInspectionValidation,
  validate,
  coolerInspectionsController.createCoolerInspection
);

router.get(
  '/cooler-inspections/status-options',
  authenticateToken,
  coolerInspectionsController.getCoolerInspectionStatusOptions
);

router.get(
  '/cooler-inspections/:id',
  authenticateToken,
  validate,
  coolerInspectionsController.getCoolerInspectionById
);

router.get(
  '/cooler-inspections',
  authenticateToken,
  coolerInspectionsController.getCoolerInspections
);

router.put(
  '/cooler-inspections/:id',
  authenticateToken,
  coolerInspectionsController.updateCoolerInspection
);

router.patch(
  '/cooler-inspections/:id/status',
  authenticateToken,
  coolerInspectionsController.updateCoolerInspectionStatus
);

router.delete(
  '/cooler-inspections/:id',
  authenticateToken,
  coolerInspectionsController.deleteCoolerInspection
);

export default router;
