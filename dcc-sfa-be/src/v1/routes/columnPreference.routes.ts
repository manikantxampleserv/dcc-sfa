import { Router } from 'express';
import { columnPreferencesController } from '../controllers/columnPreferences.controller';

const router = Router();

router.post(
  '/column-preference',
  columnPreferencesController.saveColumnPreferences
);

router.get(
  '/column-preference',
  columnPreferencesController.getAllUserPreferences
);

export default router;
