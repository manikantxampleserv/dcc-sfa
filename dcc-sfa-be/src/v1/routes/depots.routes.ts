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
import { depotsController } from '../controllers/depots.controller';
import { createDepotValidation } from '../validations/depots.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/depots',
  authenticateToken,
  auditCreate('depots'),
  requirePermission([{ module: 'depot', action: 'create' }]),
  createDepotValidation,
  validate,
  depotsController.createDepots
);

router.get(
  '/depots/:id',
  authenticateToken,
  requirePermission([{ module: 'depot', action: 'read' }]),
  validate,
  depotsController.getDepotsById
);
router.get(
  '/depots',
  authenticateToken,
  requirePermission([{ module: 'depot', action: 'read' }]),
  depotsController.getDepots
);

router.put(
  '/depots/:id',
  authenticateToken,
  auditUpdate('depots'),
  requirePermission([{ module: 'depot', action: 'update' }]),
  depotsController.updateDepots
);

router.delete(
  '/depots/:id',
  authenticateToken,
  auditDelete('depots'),
  requirePermission([{ module: 'depot', action: 'delete' }]),
  depotsController.deleteDepots
);

export default router;
