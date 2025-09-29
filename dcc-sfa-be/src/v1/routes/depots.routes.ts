import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { depotsController } from '../controllers/depots.controller';
import { createDepotValidation } from '../validations/depots.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/depots',
  authenticateToken,
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

router.put('/depots/:id', authenticateToken, depotsController.updateDepots);

router.delete('/depots/:id', authenticateToken, depotsController.deleteDepots);

export default router;
