import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { settingsController } from '../controllers/settings.controller';
import { upload } from '../../utils/multer';
import { auditUpdate } from '../../middlewares/audit.middleware';

const router = Router();

router.get('/settings', authenticateToken, settingsController.getAllSettings);

router.put(
  '/settings/:id',
  upload.single('logo'),
  authenticateToken,
  auditUpdate('settings'),
  settingsController.updateSettings
);

export default router;
