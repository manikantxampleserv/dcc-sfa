import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { aiController } from '../controllers/ai.controller';

const router = Router();

router.post('/ai/query', authenticateToken, aiController.query);

export default router;
