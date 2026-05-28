import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { upload } from '../../utils/multer';
import {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  verifyResetOtp,
} from '../controllers/auth.controller';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', upload.none(), login);
router.post('/auth/logout', authenticateToken, logout);
router.post('/auth/refresh', refresh);
router.post('/auth/forgot-password', forgotPassword);

router.post('/auth/verify-otp', verifyResetOtp);

router.post('/auth/reset-password', resetPassword);

export default router;
