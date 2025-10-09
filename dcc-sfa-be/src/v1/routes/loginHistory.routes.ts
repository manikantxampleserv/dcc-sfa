import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { loginHistoryController } from '../controllers/loginHistory.controller';
import { createLoginHistoryValidation } from '../validations/loginHistory.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/login-history',
  authenticateToken,
  createLoginHistoryValidation,
  validate,
  loginHistoryController.createLoginHistory
);

router.get(
  '/login-history/:id',
  authenticateToken,
  validate,
  loginHistoryController.getLoginHistoryById
);

router.get(
  '/login-history',
  authenticateToken,
  loginHistoryController.getLoginHistory
);

router.put(
  '/login-history/:id',
  authenticateToken,
  loginHistoryController.updateLoginHistory
);

router.delete(
  '/login-history/:id',
  authenticateToken,
  loginHistoryController.deleteLoginHistory
);

export default router;
