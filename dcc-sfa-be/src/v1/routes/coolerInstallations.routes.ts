import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { coolerInstallationsController } from '../controllers/coolerInstallations.controller';
import { createCoolerInstallationValidation } from '../validations/coolerInstallations.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/cooler-installations',
  authenticateToken,
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
  coolerInstallationsController.updateCoolerInstallation
);

router.delete(
  '/cooler-installations/:id',
  authenticateToken,
  coolerInstallationsController.deleteCoolerInstallation
);

router.patch(
  '/cooler-installations/:id/status',
  authenticateToken,
  coolerInstallationsController.updateCoolerStatus
);

export default router;
