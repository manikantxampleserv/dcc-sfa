import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
} from '../controllers/auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', authenticate, logout);
router.post('/auth/refresh', refresh);

export default router;
