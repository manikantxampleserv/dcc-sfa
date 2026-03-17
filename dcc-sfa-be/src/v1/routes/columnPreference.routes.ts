import { Router, RequestHandler } from 'express';
import { columnPreferencesController } from '../controllers/columnPreferences.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken as RequestHandler);

router.post(
  '/column-preference',
  columnPreferencesController.saveColumnPreferences as RequestHandler
);

router.get(
  '/column-preference',
  columnPreferencesController.getAllUserPreferences as RequestHandler
);

export default router;
