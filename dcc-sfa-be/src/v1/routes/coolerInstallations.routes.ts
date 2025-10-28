import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { coolerInstallationsController } from '../controllers/coolerInstallations.controller';
import { createCoolerInstallationValidation } from '../validations/coolerInstallations.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/cooler-installations',
  authenticateToken,
  auditCreate('cooler_installations'),
  createCoolerInstallationValidation,
  validate,
  coolerInstallationsController.createCoolerInstallation
);

router.get(
  '/cooler-installations/status-options',
  authenticateToken,
  coolerInstallationsController.getCoolerStatusOptions
);

router.get(
  '/cooler-installations',
  authenticateToken,
  coolerInstallationsController.getCoolerInstallations
);

router.get(
  '/cooler-installations/:id',
  authenticateToken,
  validate,
  coolerInstallationsController.getCoolerInstallationById
);

router.put(
  '/cooler-installations/:id',
  authenticateToken,
  auditUpdate('cooler_installations'),
  coolerInstallationsController.updateCoolerInstallation
);

router.delete(
  '/cooler-installations/:id',
  authenticateToken,
  auditDelete('cooler_installations'),
  coolerInstallationsController.deleteCoolerInstallation
);

router.patch(
  '/cooler-installations/:id/status',
  authenticateToken,
  coolerInstallationsController.updateCoolerStatus
);

export default router;
