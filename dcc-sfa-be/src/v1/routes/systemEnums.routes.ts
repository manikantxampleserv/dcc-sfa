import { Router } from 'express';
import { systemEnumsController } from '../controllers/systemEnums.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:key', authenticateToken, systemEnumsController.getEnumByKey);

export default router;
