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
import { coolerInstallationsController } from '../controllers/coolerInstallations.controller';
import { createCoolerInstallationValidation } from '../validations/coolerInstallations.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/cooler-installations',
  authenticateToken,
  auditCreate('cooler_installations'),
  requirePermission([{ module: 'installation', action: 'create' }]),
  createCoolerInstallationValidation,
  validate,
  coolerInstallationsController.createCoolerInstallation
);

router.get(
  '/cooler-installations/status-options',
  authenticateToken,
  requirePermission([{ module: 'installation', action: 'read' }]),
  coolerInstallationsController.getCoolerStatusOptions
);

router.get(
  '/cooler-installations',
  authenticateToken,
  requirePermission([{ module: 'installation', action: 'read' }]),
  coolerInstallationsController.getCoolerInstallations
);

router.get(
  '/cooler-installations/:id',
  authenticateToken,
  requirePermission([{ module: 'installation', action: 'read' }]),
  validate,
  coolerInstallationsController.getCoolerInstallationById
);

router.put(
  '/cooler-installations/:id',
  authenticateToken,
  auditUpdate('cooler_installations'),
  requirePermission([{ module: 'installation', action: 'update' }]),
  coolerInstallationsController.updateCoolerInstallation
);

router.delete(
  '/cooler-installations/:id',
  authenticateToken,
  auditDelete('cooler_installations'),
  requirePermission([{ module: 'installation', action: 'delete' }]),
  coolerInstallationsController.deleteCoolerInstallation
);

router.patch(
  '/cooler-installations/:id/status',
  authenticateToken,
  requirePermission([{ module: 'installation', action: 'update' }]),
  coolerInstallationsController.updateCoolerStatus
);

export default router;
