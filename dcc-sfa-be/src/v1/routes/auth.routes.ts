import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
} from '../controllers/auth.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { upload } from '../../utils/multer';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', upload.none(), login);
router.post(
  '/auth/logout',
  authenticateToken,
  requirePermission([{ module: 'profile', action: 'update' }]),
  logout
);
router.post('/auth/refresh', refresh);

export default router;
