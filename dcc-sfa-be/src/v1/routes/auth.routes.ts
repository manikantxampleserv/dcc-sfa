import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
} from '../controllers/auth.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { upload } from '../../utils/multer';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', upload.none(), login);
router.post('/auth/logout', authenticateToken, logout);
router.post('/auth/refresh', refresh);

export default router;
