import { Router } from 'express';
import { visitsController } from '../controllers/visits.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/visits', authenticateToken, visitsController.createVisits);
router.get('/visits', authenticateToken, visitsController.getAllVisits);
router.get('/visits/:id', authenticateToken, visitsController.getVisitsById);
router.put('/visits/:id', authenticateToken, visitsController.updateVisits);
router.delete('/visits/:id', authenticateToken, visitsController.deleteVisits);

export default router;
