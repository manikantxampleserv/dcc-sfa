import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  createDepotValidation,
  validate,
  depotsController.createDepots
);

router.get(
  '/depots/:id',
  authenticateToken,
  validate,
  depotsController.getDepotsById
);
router.get('/depots', authenticateToken, depotsController.getDepots);

router.put(
  '/depots/:id',
  authenticateToken,
  auditUpdate('depots'),
  depotsController.updateDepots
);

router.delete(
  '/depots/:id',
  authenticateToken,
  auditDelete('depots'),
  depotsController.deleteDepots
);

export default router;
