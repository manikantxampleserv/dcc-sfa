import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { routesController } from '../controllers/routes.controller';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/routes',
  authenticateToken,
  validate,
  routesController.createRoutes
);

router.get(
  '/routes/:id',
  authenticateToken,
  validate,
  routesController.getRoutesById
);
router.get('/routes', authenticateToken, routesController.getRoutes);

router.put('/routes/:id', authenticateToken, routesController.updateRoutes);

router.delete('/routes/:id', authenticateToken, routesController.deleteRoutes);

export default router;
