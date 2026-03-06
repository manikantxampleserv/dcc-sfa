import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
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
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

export default router;
